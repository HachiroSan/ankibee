# AnkiBee Technical Stack

## Architecture
Desktop application built on Nextron framework, integrating Electron with Next.js and TypeScript. Implements a modern React architecture with server-side rendering capabilities.

## Core Stack

### Runtime Environment
1. **Nextron (v8.12.0)**
   - Electron + Next.js integration layer
   - HMR enabled
   - Production build optimization

2. **Next.js (v13.5.6) & React (v18.2.0)**
   - SSR implementation
   - TypeScript runtime
   - Component architecture

### Frontend Framework
1. **Tailwind CSS (v3.4.3)**
   - JIT compilation
   - Custom theme system

2. **Radix UI**
   - Headless components:
     ```
     Alert Dialog
     Avatar
     Dialog
     Dropdown
     Select
     Toast
     Tooltip
     ```

3. **UI Libraries**
   - Framer Motion: Animation system
   - Lucide React: SVG icon system
   - Sonner: Toast queue manager
   - WaveSurfer.js: Audio visualization engine

### Directory Structure
```
├── app/                  # Electron main process
├── renderer/            # Next.js frontend
│   ├── components/     
│   ├── contexts/       
│   ├── lib/           
│   ├── pages/         
│   └── types/         
└── resources/          # Assets
```

### System Integration
1. **Native Features**
   - Local storage system
   - Update mechanism
   - Cross-platform compatibility

2. **Development Tools**
   - TypeScript compiler
   - HMR system
   - Python runtime

### External Services
1. **Dictionary API**
   - Endpoint: api.dictionaryapi.dev/v2
   - Data: Definitions, usage
   - Response: JSON structured data

2. **Audio System**
   - Source: Google Dictionary
   - Method: DOM scraping
   - Target: Pronunciation audio elements

### Build Configuration
```json
{
  "dev": "nextron",
  "build": "node scripts/setup-python.js && nextron build",
  "build:win": "node scripts/setup-python.js && nextron build --win --x64",
  "build:linux": "node scripts/setup-python.js && nextron build --linux --x64"
}
```

## Conclusion
AnkiBee demonstrates modern desktop application development practices, focusing on developer experience and user interface quality. For detailed implementation specifics, refer to the component files and configuration. 