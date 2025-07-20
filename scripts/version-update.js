#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get version from command line arguments
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Usage: node scripts/version-update.js <new-version>');
  console.error('Example: node scripts/version-update.js 1.2.0');
  process.exit(1);
}

// Validate version format
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Invalid version format. Use semantic versioning (e.g., 1.2.0)');
  process.exit(1);
}

console.log(`🚀 Updating AnkiBee to version ${newVersion}...`);

try {
  // 1. Update package.json
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const oldVersion = packageJson.version;
  
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log(`✅ Updated package.json: ${oldVersion} → ${newVersion}`);

  // 2. Update version.ts file
  const versionPath = path.join(__dirname, '..', 'renderer', 'lib', 'version.ts');
  let versionContent = fs.readFileSync(versionPath, 'utf8');
  versionContent = versionContent.replace(
    /export const APP_VERSION = ['"]\d+\.\d+\.\d+['"]/,
    `export const APP_VERSION = '${newVersion}'`
  );
  fs.writeFileSync(versionPath, versionContent);
  
  console.log(`✅ Updated version.ts: ${oldVersion} → ${newVersion}`);

  // 3. Check if there are uncommitted changes
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (status.trim()) {
    console.log('⚠️  You have uncommitted changes. Please commit them first.');
    process.exit(1);
  }

  // 4. Commit the version change
  execSync('git add package.json renderer/lib/version.ts');
  try {
    execSync(`git commit -m "chore: bump version to ${newVersion}"`);
    console.log(`✅ Committed version change`);
  } catch (error) {
    console.log('⚠️  Version change might already be committed, continuing...');
  }

  // 5. Create and push tag
  execSync(`git tag v${newVersion}`);
  execSync(`git push origin v${newVersion}`);
  console.log(`✅ Created and pushed tag v${newVersion}`);

  // 6. Build the application
  console.log('🔨 Building application...');
  execSync('npm run build:win', { stdio: 'inherit' });
  console.log('✅ Build completed');

  console.log(`\n🎉 Version ${newVersion} has been successfully released!`);
  console.log(`📦 Check GitHub releases: https://github.com/HachiroSan/ankibee/releases`);

} catch (error) {
  console.error('❌ Error during version update:', error.message);
  process.exit(1);
} 