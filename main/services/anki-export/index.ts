import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { promises as fsPromises } from 'fs'
import { app, dialog, BrowserWindow } from 'electron'
import { WordCard } from '../../../renderer/types/deck'

interface AnkiExportOptions {
  deckName: string
  cards: WordCard[]
  window?: BrowserWindow
}

class AnkiExportService {
  private pythonExecutablePath: string
  private scriptPath: string
  private resourcesPath: string

  constructor() {
    const isDev = process.env.NODE_ENV !== 'production'
    
    if (isDev) {
      // In development, use system Python
      this.pythonExecutablePath = process.platform === 'win32' ? 'python' : 'python3'
      this.resourcesPath = path.join(app.getAppPath())
      this.scriptPath = path.join(
        this.resourcesPath,
        'main',
        'services',
        'anki-export',
        'generate_deck.py'
      )
    } else {
      // In production, use bundled Python
      this.resourcesPath = process.resourcesPath
      this.pythonExecutablePath = path.join(
        this.resourcesPath,
        'python',
        process.platform === 'win32' ? 'python.exe' : 'bin/python3'
      )
      this.scriptPath = path.join(
        this.resourcesPath,
        'python',
        'generate_deck.py'
      )
    }

    // Verify Python script exists
    if (!fs.existsSync(this.scriptPath)) {
      throw new Error(`Python script not found at: ${this.scriptPath}`)
    }
  }

  private async ensureOutputDir(): Promise<string> {
    const outputDir = path.join(app.getPath('userData'), 'anki-exports')
    await fsPromises.mkdir(outputDir, { recursive: true })
    return outputDir
  }

  private async prepareMediaFiles(cards: WordCard[]): Promise<string[]> {
    const mediaFiles: string[] = []
    const outputDir = await this.ensureOutputDir()

    for (const card of cards) {
      // Check for audio data in audioData or audioPath
      if (card.audioData || card.audioPath) {
        // Create a filename that Anki will recognize
        const fileName = `${card.word.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp3`
        const outputPath = path.join(outputDir, fileName)
        
        try {
          if (card.audioPath) {
            // If we have a path, copy the file
            await fsPromises.copyFile(card.audioPath, outputPath)
          } else if (card.audioData) {
            // If we have audio data, write it to a file
            await fsPromises.writeFile(outputPath, Buffer.from(card.audioData))
          }
          
          mediaFiles.push(outputPath)
          card.audioFileName = fileName
          console.log(`Prepared audio file for ${card.word}: ${fileName}`)
        } catch (error) {
          console.error(`Failed to prepare audio file for ${card.word}:`, error)
          throw new Error(`Failed to prepare audio for ${card.word}`)
        }
      }
    }

    return mediaFiles
  }

  private async verifyPythonEnvironment(): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonExecutablePath, ['-c', 'import genanki'])
      
      process.stderr.on('data', (data) => {
        console.error('Python environment check error:', data.toString())
      })

      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('genanki package is not installed. Please run: pip install genanki==0.13.0'))
        } else {
          resolve()
        }
      })
    })
  }

  private async getSaveFilePath(window: BrowserWindow | undefined, defaultName: string): Promise<string | null> {
    const options: Electron.SaveDialogOptions = {
      title: 'Export Anki Deck',
      defaultPath: path.join(app.getPath('downloads'), `${defaultName}.apkg`),
      filters: [
        { name: 'Anki Deck', extensions: ['apkg'] }
      ],
      properties: ['createDirectory', 'showOverwriteConfirmation']
    }

    const result = window 
      ? await dialog.showSaveDialog(window, options)
      : await dialog.showSaveDialog(options)

    if (result.canceled) {
      return null
    }

    return result.filePath
  }

  async exportDeck({ deckName, cards, window }: AnkiExportOptions): Promise<{ success: boolean; filePath: string }> {
    try {
      // Verify Python environment first
      await this.verifyPythonEnvironment()

      // Get save location from user
      const outputPath = await this.getSaveFilePath(window, deckName)
      if (!outputPath) {
        throw new Error('Export cancelled by user')
      }

      // Log card data for debugging
      console.log('Checking cards for export:')
      cards.forEach((card, index) => {
        console.log(`Card ${index + 1}:`, {
          word: card.word,
          hasDefinition: !!card.definition,
          hasAudioData: !!card.audioData,
          hasAudioPath: !!card.audioPath,
          audioPath: card.audioPath,
        })
      })

      // Filter out cards without required data
      const validCards = cards.filter(card => {
        const isValid = card.word?.trim() && 
          card.definition?.trim() &&
          (card.audioData || card.audioPath)

        if (!isValid) {
          console.log(`Invalid card:`, {
            word: card.word,
            hasDefinition: !!card.definition?.trim(),
            hasAudio: !!(card.audioData || card.audioPath)
          })
        }

        return isValid
      })

      if (validCards.length === 0) {
        console.error('Card validation failed. No valid cards found.')
        console.log('Card requirements:', {
          needsWord: true,
          needsDefinition: true,
          needsAudio: true,
        })
        throw new Error('No valid cards to export. Each card must have a word, definition, and audio.')
      }

      console.log('Export validation:', {
        total: cards.length,
        valid: validCards.length,
        sample: {
          word: validCards[0].word,
          hasDefinition: !!validCards[0].definition,
          hasAudioData: !!validCards[0].audioData,
          hasAudioPath: !!validCards[0].audioPath,
        }
      })

      // Prepare media files
      const mediaFiles = await this.prepareMediaFiles(validCards)

      if (mediaFiles.length === 0) {
        throw new Error('Failed to prepare audio files for export')
      }

      // Prepare input data for Python script
      const inputData = {
        deckName,
        cards: validCards,
        mediaFiles,
        outputPath
      }

      // Execute Python script
      const result = await new Promise<{ success: boolean; outputPath: string; error?: string }>((resolve, reject) => {
        console.log('Executing Python script:', this.pythonExecutablePath);
        console.log('Script path:', this.scriptPath);
        console.log('Working directory:', process.cwd());
        
        const pythonProcess = spawn(this.pythonExecutablePath, [this.scriptPath], {
          env: {
            ...process.env,
            PYTHONIOENCODING: 'utf-8',
            PYTHONUNBUFFERED: '1'
          }
        })

        let stdout = ''
        let stderr = ''

        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString()
          console.log('Python stdout:', data.toString())
        })

        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString()
          console.error('Python stderr:', data.toString())
        })

        pythonProcess.on('error', (error) => {
          console.error('Failed to start Python process:', error)
          reject(error)
        })

        pythonProcess.on('close', (code) => {
          console.log('Python process exited with code:', code)
          if (code === 0 && stdout) {
            try {
              const result = JSON.parse(stdout)
              resolve(result)
            } catch (e) {
              console.error('Failed to parse Python output:', stdout)
              reject(new Error('Failed to parse Python script output'))
            }
          } else {
            reject(new Error(stderr || 'Python script execution failed'))
          }
        })

        // Write input data to stdin
        const inputStr = JSON.stringify(inputData)
        console.log('Sending input to Python:', inputStr)
        pythonProcess.stdin.write(inputStr)
        pythonProcess.stdin.end()
      })

      // Clean up temporary media files
      await Promise.all(mediaFiles.map(file => fsPromises.unlink(file)))

      if (!result.success) {
        throw new Error(result.error || 'Failed to create Anki package')
      }

      return {
        success: true,
        filePath: outputPath
      }
    } catch (error) {
      console.error('Anki export error:', error)
      throw error
    }
  }
}

export const ankiExportService = new AnkiExportService() 