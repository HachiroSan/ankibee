# AnkiBee

<div align="center">
  <img src="https://github.com/HachiroSan/ankibee/blob/27896b87beaf3264ba60f16bf5ae99fa031c82d0/resources/icon.png" alt="AnkiBee Logo" width="120"/>
</div>

A desktop application designed to help teachers and students master spelling bee competitions through intelligent flashcard creation and comprehensive audio pronunciation training. To be used in conjunction with the [Anki](https://apps.ankiweb.net/) flashcard application.

<div align="center">
  <a href="https://github.com/HachiroSan/ankibee/releases/latest">
    <img src="https://img.shields.io/github/v/release/HachiroSan/ankibee?style=flat-square" alt="Latest Release">
  </a>
  <a href="https://github.com/HachiroSan/ankibee/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/HachiroSan/ankibee?style=flat-square&logo=gnu&label=license&color=blue" alt="License">
  </a>
  <img src="https://img.shields.io/badge/platform-windows-lightgrey?style=flat-square" alt="Platform">
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Electron-2B2E3A?style=flat-square&logo=electron&logoColor=white" alt="Electron">
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind">
</div>

<div align="center">
  <img src="https://github.com/HachiroSan/ankibee/blob/27896b87beaf3264ba60f16bf5ae99fa031c82d0/resources/screenshot.png" alt="AnkiBee Screenshot" width="800"/>
</div>

## Features

### Card Generation
- Automated flashcard creation for spelling bee practice
- Intelligent word definition fetching
- Configurable audio pronunciation sources

### Audio System
- Integration with Google Dictionary API
- Support for custom audio uploads
- Real-time audio waveform display

### Batch Operations
- Multi-word import functionality
- Duplicate entry prevention
- Parallel audio processing

## Installation

### Download

**Windows**
- [Installer (Recommended)](https://github.com/HachiroSan/ankibee/releases/latest/download/AnkiBee.Setup.1.0.0.exe)
- [Portable Version](https://github.com/HachiroSan/ankibee/releases/latest/download/AnkiBee-1.0.0-win-x64-portable.zip)

View all releases on the [releases page](https://github.com/HachiroSan/ankibee/releases).

### Development Setup

```bash
# Repository
git clone https://github.com/HachiroSan/ankibee
cd ankibee

# Dependencies
yarn install

# Development
yarn dev

# Production Build
yarn build
```

## Technology Stack

| Technology | Purpose |
|------------|---------|
| Electron | Cross-platform desktop runtime |
| Next.js | React framework for UI |
| TypeScript | Type-safe development |
| Tailwind CSS | Utility-first styling |

## Building

To create a production build:

```bash
yarn build
```

The packaged application will be available in the `dist` directory.

## License

This software is licensed under the [GNU General Public License v3.0](LICENSE). Users are free to use, modify, and distribute this software under the terms specified in the GPL-3.0 license.