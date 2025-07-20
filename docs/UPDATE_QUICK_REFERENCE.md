# AnkiBee Update Quick Reference

## 🚀 Quick Commands

### Standard Release
```bash
npm run version:update 1.3.0
```

### Bug Fix Release
```bash
npm run version:update 1.2.1
```

### Major Release
```bash
npm run version:update 2.0.0
```

## 📋 Common Scenarios

### Scenario 1: New Feature Release
```bash
# 1. Complete your feature development
git add .
git commit -m "feat: add new feature"

# 2. Update version (minor bump)
npm run version:update 1.3.0

# 3. Create GitHub release manually
# - Go to GitHub releases
# - Upload files from dist/
# - Add release notes
```

### Scenario 2: Bug Fix Release
```bash
# 1. Fix the bug
git add .
git commit -m "fix: resolve bug description"

# 2. Update version (patch bump)
npm run version:update 1.2.1

# 3. Test the fix
# - Install new version
# - Verify bug is resolved
```

### Scenario 3: Hotfix Release
```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-bug

# 2. Fix the critical issue
git add .
git commit -m "fix: critical bug description"

# 3. Update version
npm run version:update 1.2.1

# 4. Merge and release
git checkout master
git merge hotfix/critical-bug
git push origin master
```

## 🔧 Troubleshooting Quick Fixes

### Build Fails
```bash
# Clean everything
rm -rf dist/ node_modules/
yarn install
npm run build:win
```

### Version Mismatch
```bash
# Check current versions
grep -r "1.2.0" package.json renderer/lib/version.ts

# Fix manually if needed
npm run version:update 1.3.0
```

### Git Tag Issues
```bash
# Remove problematic tag
git tag -d v1.3.0
git push origin --delete v1.3.0

# Recreate
npm run version:update 1.3.0
```

### Auto-Update Not Working
```bash
# Check latest.yml exists
ls dist/latest.yml

# Verify GitHub release is public
# Check installer files are uploaded
```

## 📁 Key Files

| File | Purpose | Updated By |
|------|---------|------------|
| `package.json` | Main version | Script |
| `renderer/lib/version.ts` | UI version | Script |
| `dist/latest.yml` | Auto-update feed | Build |
| `dist/AnkiBee-Setup-X.X.X.exe` | Installer | Build |

## 🎯 Version Display Locations

- **Title Bar**: `AnkiBee - Spelling Bee Deck Maker v1.2.0`
- **Settings → About**: Version and build info
- **Settings Footer**: `Made with ❤️ by Hachiro • v1.2.0`
- **Home Footer**: `AnkiBee - Spelling Bee Deck Maker | v1.2.0`

## ⚡ One-Liner Updates

```bash
# Patch release
npm run version:update 1.2.1

# Minor release  
npm run version:update 1.3.0

# Major release
npm run version:update 2.0.0

# Build only (if version already updated)
npm run build:win
```

## 🔍 Verification Commands

```bash
# Check current version
grep '"version"' package.json
grep 'APP_VERSION' renderer/lib/version.ts

# Check git tags
git tag --sort=-version:refname | head -5

# Check build output
ls -la dist/

# Test auto-update feed
curl https://github.com/HachiroSan/ankibee/releases/latest/download/latest.yml
```

## 📝 Release Notes Template

```markdown
# AnkiBee v1.3.0 - [Release Title]

## What's New
- Feature 1
- Feature 2
- Feature 3

## Bug Fixes
- Fixed issue with...
- Resolved problem with...

## Performance
- Improved performance by...
- Optimized...

## Installation
- **Installer**: [AnkiBee-Setup-1.3.0.exe](link)
- **Portable**: [AnkiBee-1.3.0.exe](link)

## Auto-Update
This version includes auto-update functionality.
```

## 🚨 Emergency Procedures

### Rollback Release
```bash
# 1. Delete the problematic tag
git tag -d v1.3.0
git push origin --delete v1.3.0

# 2. Revert to previous version
npm run version:update 1.2.0

# 3. Create new release
npm run version:update 1.2.1
```

### Fix Broken Auto-Update
```bash
# 1. Check latest.yml format
cat dist/latest.yml

# 2. Verify GitHub release
# - Ensure release is public
# - Check installer files are uploaded
# - Verify latest.yml is accessible

# 3. Rebuild if needed
npm run build:win
```

---

**Quick Tip**: Always test the installer on a clean system before releasing! 