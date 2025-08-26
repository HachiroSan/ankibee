import path from 'path'
import { promises as fs } from 'fs'
import sharp from 'sharp'

export interface CompressionOptions {
	enabled?: boolean
	maxDimension?: number
	jpegQuality?: number
	pngQuality?: number
	pngCompressionLevel?: number
	pngEffort?: number
	gifEffort?: number
}

export interface CompressedResult {
	filePath: string
	fileName: string
	inputBytes: number
	outputBytes: number
	format: 'gif' | 'png' | 'jpg'
}

/**
 * Detect if a buffer looks like a GIF (by header bytes).
 */
export function isLikelyGif(buffer: Buffer): boolean {
	return buffer.length >= 6 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38
}

function detectFormat(buffer: Buffer): 'gif' | 'png' | 'jpg' {
	if (buffer.length >= 4) {
		// PNG signature 89 50 4E 47
		if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'png'
		// GIF signature 47 49 46 38
		if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return 'gif'
		// JPEG SOI FF D8
		if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'jpg'
	}
	return 'jpg'
}

/**
 * Compress an image buffer and write to disk.
 * Implementation is added TDD-style; initial placeholder throws until tests guide behavior.
 */
export async function compressAndWriteImage(input: Buffer, basePathNoExt: string, options?: CompressionOptions): Promise<CompressedResult> {
	const enabled = options?.enabled !== false
	const inputBytes = input.length

	// If GIF, keep as GIF
	if (isLikelyGif(input)) {
		const gifPath = `${basePathNoExt}.gif`
		if (!enabled) {
			await fs.writeFile(gifPath, input)
			return { filePath: gifPath, fileName: path.basename(gifPath), inputBytes, outputBytes: input.length, format: 'gif' }
		}
		try {
			const out = await sharp(input, { animated: true, failOn: 'none' }).gif({ effort: options?.gifEffort ?? 7 }).toBuffer()
			const finalBuf = out.length <= input.length ? out : input
			await fs.writeFile(gifPath, finalBuf)
			return { filePath: gifPath, fileName: path.basename(gifPath), inputBytes, outputBytes: finalBuf.length, format: 'gif' }
		} catch {
			await fs.writeFile(gifPath, input)
			return { filePath: gifPath, fileName: path.basename(gifPath), inputBytes, outputBytes: input.length, format: 'gif' }
		}
	}

	// Try to decode with sharp
	const image = sharp(input, { failOn: 'none' })
	const meta = await image.metadata()

	const MAX_DIM = options?.maxDimension ?? 1280
	const JPEG_Q = options?.jpegQuality ?? 72

	let pipeline = image
	if (enabled && ((meta.width ?? 0) > MAX_DIM || (meta.height ?? 0) > MAX_DIM)) {
		pipeline = pipeline.resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true })
	}

	if (meta.hasAlpha) {
		const pngPath = `${basePathNoExt}.png`
		if (!enabled) {
			await fs.writeFile(pngPath, input)
			return { filePath: pngPath, fileName: path.basename(pngPath), inputBytes, outputBytes: input.length, format: 'png' }
		}
		const buf = await pipeline.png({ 
			palette: true, 
			quality: options?.pngQuality ?? 70, 
			compressionLevel: options?.pngCompressionLevel ?? 9, 
			effort: options?.pngEffort ?? 7 
		}).toBuffer()
		await fs.writeFile(pngPath, buf)
		return { filePath: pngPath, fileName: path.basename(pngPath), inputBytes, outputBytes: buf.length, format: 'png' }
	}

	// Opaque: JPEG
	const jpgPath = `${basePathNoExt}.jpg`
	if (!enabled) {
		const ext = detectFormat(input)
		const rawPath = `${basePathNoExt}.${ext}`
		await fs.writeFile(rawPath, input)
		return { filePath: rawPath, fileName: path.basename(rawPath), inputBytes, outputBytes: input.length, format: ext }
	}
	const buf = await pipeline.jpeg({ quality: JPEG_Q, progressive: true, mozjpeg: true }).toBuffer()
	await fs.writeFile(jpgPath, buf)
	return { filePath: jpgPath, fileName: path.basename(jpgPath), inputBytes, outputBytes: buf.length, format: 'jpg' }
}


