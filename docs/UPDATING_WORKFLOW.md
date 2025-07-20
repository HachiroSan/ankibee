# AnkiBee Update Workflow Documentation

## Overview

This document outlines the complete workflow for updating and releasing new versions of AnkiBee. The project uses a streamlined process that automates version management, building, and publishing to GitHub releases.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Version Management](#version-management)
3. [Automated Update Process](#automated-update-process)
4. [Manual Update Process](#manual-update-process)
5. [Auto-Update System](#auto-update-system)
6. [Release Checklist](#release-checklist)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before updating AnkiBee, ensure you have:

- **Git Access**: Write access to the `HachiroSan/ankibee` repository
- **Node.js**: Version 16 or higher
- **Yarn**: Package manager (recommended)
- **Python**: Required for Anki export functionality
- **GitHub Token**: For automated releases (optional)

## Version Management

### Version Format
AnkiBee follows [Semantic Versioning](https://semver.org/) (SemVer):
- **Major** (X.0.0): Breaking changes, major rewrites
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, small improvements

### Version Locations
The version is managed in multiple files:
- `package.json` - Main version for electron-builder
- `renderer/lib/version.ts` - Centralized version for UI display
- Git tags - Release markers (e.g., `v1.2.0`)

### Version Display
The current version is displayed in:
- **Title Bar**: "AnkiBee - Spelling Bee Deck Maker v1.2.0"
- **Settings Dialog**: About section with version and build info
- **Home Page Footer**: Subtle version indicator
- **Settings Footer**: "Made with ❤️ by Hachiro • v1.2.0"

## Automated Update Process

### Quick Update (Recommended)

```bash
# Update to a new version
npm run version:update 1.3.0
```

This single command performs:
1. ✅ Updates `package.json` version
2. ✅ Updates `renderer/lib/version.ts` version
3. ✅ Validates version format
4. ✅ Checks for uncommitted changes
5. ✅ Commits version changes
6. ✅ Creates and pushes git tag
7. ✅ Builds the application
8. ✅ Generates installer files

### What the Script Does

```javascript
// 1. Update package.json
packageJson.version = newVersion;

// 2. Update version.ts
export const APP_VERSION = '1.3.0';

// 3. Git operations
git add package.json renderer/lib/version.ts
git commit -m "chore: bump version to 1.3.0"
git tag v1.3.0
git push origin v1.3.0

// 4. Build application
npm run build:win
```

### Build Output
After successful build, the following files are created in `dist/`:
- `AnkiBee-Setup-1.3.0.exe` - Windows installer
- `AnkiBee-1.3.0.exe` - Portable version
- `latest.yml` - Auto-update configuration
- `builder-effective-config.yaml` - Build configuration

## Manual Update Process

If you prefer manual control or need to customize the process:

### Step 1: Update Version Files

```bash
# Update package.json
# Change "version": "1.2.0" to "version": "1.3.0"

# Update renderer/lib/version.ts
# Change APP_VERSION = '1.2.0' to APP_VERSION = '1.3.0'
```

### Step 2: Commit Changes

```bash
git add package.json renderer/lib/version.ts
git commit -m "chore: bump version to 1.3.0"
```

### Step 3: Create Release Tag

```bash
git tag v1.3.0
git push origin v1.3.0
```

### Step 4: Build Application

```bash
# Build for Windows
npm run build:win

# Build for all platforms
npm run build
```

### Step 5: Create GitHub Release

1. Go to [GitHub Releases](https://github.com/HachiroSan/ankibee/releases)
2. Click "Draft a new release"
3. Select the tag `v1.3.0`
4. Add release title and notes
5. Upload installer files from `dist/` directory
6. Publish release

## Auto-Update System

### How It Works

AnkiBee uses `electron-updater` for automatic updates:

1. **Check for Updates**: App checks GitHub releases on startup
2. **Version Comparison**: Compares current version with latest release
3. **Download**: Downloads installer if newer version available
4. **Install**: Installs update on app restart

### Configuration

```yaml
# electron-builder.yml
publish:
  provider: github
  owner: HachiroSan
  repo: ankibee
  private: false
  releaseType: release
```

```typescript
// main/background.ts
autoUpdater.autoDownload = false;  // Manual download
autoUpdater.autoInstallOnAppQuit = true;  // Auto-install on quit
```

### Update Flow

```
App Start → Check latest.yml → Compare Versions → Notify User → Download → Install on Restart
```

### Update Feed Structure

```yaml
# latest.yml (auto-generated)
version: 1.3.0
files:
  - url: AnkiBee-Setup-1.3.0.exe
    sha512: [checksum]
    size: 99104713
path: AnkiBee-Setup-1.3.0.exe
sha512: [checksum]
releaseDate: '2025-07-20T10:30:00.000Z'
```

## Release Checklist

### Pre-Release
- [ ] All features are complete and tested
- [ ] No critical bugs remain
- [ ] Documentation is updated
- [ ] Changelog is prepared
- [ ] All changes are committed

### Release Process
- [ ] Run `npm run version:update X.Y.Z`
- [ ] Verify build completes successfully
- [ ] Test installer on clean system
- [ ] Create GitHub release with notes
- [ ] Upload installer files
- [ ] Publish release

### Post-Release
- [ ] Verify auto-update works
- [ ] Monitor for any issues
- [ ] Update documentation if needed
- [ ] Tag release in project management

## Version Update Examples

### Patch Release (Bug Fix)
```bash
npm run version:update 1.2.1
# Changes: 1.2.0 → 1.2.1
```

### Minor Release (New Features)
```bash
npm run version:update 1.3.0
# Changes: 1.2.0 → 1.3.0
```

### Major Release (Breaking Changes)
```bash
npm run version:update 2.0.0
# Changes: 1.2.0 → 2.0.0
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clean and rebuild
rm -rf dist/ node_modules/
yarn install
npm run build:win
```

#### Git Tag Issues
```bash
# Delete local tag
git tag -d v1.3.0

# Delete remote tag
git push origin --delete v1.3.0

# Recreate tag
git tag v1.3.0
git push origin v1.3.0
```

#### Version Mismatch
```bash
# Check all version locations
grep -r "1.2.0" package.json renderer/lib/version.ts

# Update manually if needed
# Then run: npm run version:update 1.3.0
```

#### Auto-Update Issues
- Verify `latest.yml` is accessible
- Check GitHub release is public
- Ensure installer files are uploaded
- Test on clean installation

### Error Messages

#### "You have uncommitted changes"
```bash
# Commit or stash changes first
git add .
git commit -m "feat: your changes"
npm run version:update 1.3.0
```

#### "Invalid version format"
```bash
# Use semantic versioning
npm run version:update 1.3.0  # ✅ Correct
npm run version:update 1.3    # ❌ Wrong
```

#### "Build failed"
```bash
# Check Python environment
node scripts/setup-python.js

# Check dependencies
yarn install

# Try building again
npm run build:win
```

## Best Practices

### Version Naming
- Use semantic versioning consistently
- Document breaking changes clearly
- Update changelog for each release

### Release Frequency
- **Patch**: Weekly for bug fixes
- **Minor**: Monthly for new features
- **Major**: Quarterly for major changes

### Testing
- Test installer on clean Windows system
- Verify auto-update functionality
- Test all new features thoroughly

### Documentation
- Update README.md with new features
- Maintain changelog
- Update this workflow document

## File Structure

```
ankibee/
├── package.json                 # Main version
├── renderer/lib/version.ts      # UI version display
├── scripts/version-update.js    # Update automation
├── electron-builder.yml         # Build configuration
├── dist/                        # Build output
│   ├── AnkiBee-Setup-1.3.0.exe
│   ├── AnkiBee-1.3.0.exe
│   └── latest.yml
└── UPDATING_WORKFLOW.md         # This document
```

## Support

For issues with the update workflow:
1. Check this documentation
2. Review error messages carefully
3. Verify all prerequisites are met
4. Test on clean environment
5. Create issue on GitHub if needed

---

**Last Updated**: July 20, 2025  
**Version**: 1.2.0  
**Maintainer**: Hachiro 