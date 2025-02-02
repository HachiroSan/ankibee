const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { createWriteStream } = require('fs');
const { pipeline } = require('stream/promises');

const PYTHON_VERSION = '3.9.13'; // Use a specific version for consistency
const BASE_DIR = process.cwd();
const RESOURCES_DIR = path.join(BASE_DIR, 'resources');
const PYTHON_DIR = path.join(RESOURCES_DIR, 'python');
const REQUIREMENTS = ['genanki==0.13.0'];

async function downloadFile(url, dest) {
  const response = await new Promise((resolve, reject) => {
    https.get(url, resolve).on('error', reject);
  });

  if (response.statusCode !== 200) {
    throw new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`);
  }

  await pipeline(response, createWriteStream(dest));
}

async function setupPython() {
  try {
    // Create resources directory if it doesn't exist
    if (!fs.existsSync(RESOURCES_DIR)) {
      fs.mkdirSync(RESOURCES_DIR, { recursive: true });
    }

    // Create python directory if it doesn't exist
    if (!fs.existsSync(PYTHON_DIR)) {
      fs.mkdirSync(PYTHON_DIR, { recursive: true });
    }

    // Download and install Python (platform specific)
    if (process.platform === 'win32') {
      const pythonInstaller = path.join(RESOURCES_DIR, 'python-installer.exe');
      const pythonUrl = `https://www.python.org/ftp/python/${PYTHON_VERSION}/python-${PYTHON_VERSION}-amd64.exe`;
      
      console.log('Downloading Python installer...');
      await downloadFile(pythonUrl, pythonInstaller);
      
      console.log('Installing Python...');
      const installCommand = `"${pythonInstaller}" /quiet InstallAllUsers=0 PrependPath=0 Include_test=0 Include_pip=1 TargetDir="${PYTHON_DIR}"`;
      try {
        execSync(installCommand, { 
          stdio: 'inherit',
          env: { ...process.env },
          shell: true
        });
      } catch (error) {
        console.error('Failed to install Python:', error);
        process.exit(1);
      }
      
      // Clean up installer
      if (fs.existsSync(pythonInstaller)) {
        fs.unlinkSync(pythonInstaller);
      }
    } else {
      // For macOS and Linux, we'll use pyenv or the system Python
      console.log('Using system Python...');
      execSync(`python3 -m venv "${PYTHON_DIR}"`, { stdio: 'inherit' });
    }

    // Install requirements
    const pythonExe = process.platform === 'win32' 
      ? path.join(PYTHON_DIR, 'python.exe')
      : path.join(PYTHON_DIR, 'bin', 'python');

    console.log('Installing pip...');
    try {
      execSync(`"${pythonExe}" -m ensurepip --upgrade`, {
        stdio: 'inherit',
        shell: true
      });
    } catch (error) {
      console.error('Failed to install pip:', error);
      process.exit(1);
    }

    console.log('Installing Python packages...');
    try {
      execSync(`"${pythonExe}" -m pip install ${REQUIREMENTS.join(' ')}`, {
        stdio: 'inherit',
        shell: true
      });
    } catch (error) {
      console.error('Failed to install packages:', error);
      process.exit(1);
    }

    // Copy the Python script
    const scriptSource = path.join(BASE_DIR, 'main', 'services', 'anki-export', 'generate_deck.py');
    const scriptDest = path.join(PYTHON_DIR, 'generate_deck.py');
    
    if (fs.existsSync(scriptSource)) {
      fs.copyFileSync(scriptSource, scriptDest);
      console.log('Python script copied successfully');
    } else {
      console.warn('Warning: Could not find generate_deck.py script');
    }

    console.log('Python environment setup complete!');
  } catch (error) {
    console.error('Failed to set up Python environment:', error);
    process.exit(1);
  }
}

setupPython(); 