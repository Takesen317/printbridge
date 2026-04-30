# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PrintBridge is a cross-platform desktop application (Electron + React) that bridges digital media design and print engineering. It helps students and professionals understand color management and print workflow.

## Commands

```bash
# Development
npm run dev          # Start Vite dev server with Electron

# Build
npm run build       # Full build (TypeScript + Vite + electron-builder)
npm run build:win    # Windows installer + portable
npm run build:mac    # macOS dmg
npm run build:dir    # Build unpacked directory

# Type checking
npx tsc --noEmit    # TypeScript validation without emit
```

## Architecture

### Electron Process Model
- **Main Process** (`src/main/index.ts`): Electron window management, menu system, IPC handlers
- **Preload Script** (`src/preload/index.ts`): Secure context bridge exposing electronAPI to renderer
- **Renderer Process** (`src/renderer/`): React application running in Chromium

### React Module Structure
```
src/renderer/
├── modules/           # Four main feature modules
│   ├── color-lab/     # Color management (ICC, RGB↔CMYK, soft-proofing)
│   ├── cross-preview/ # Cross-media preview (side-by-side, overlay comparison)
│   ├── print-adapter/ # Print readiness checker (problem detection, wizard)
│   └── knowledge-hub/ # Learning resources (cases, demos, quizzes)
├── services/         # Business logic layer
│   ├── color-engine.ts      # Color conversion, ΔE calculation
│   ├── image-processor.ts    # Print preview simulation
│   └── print-checker.ts    # Print problem detection
├── store/            # Zustand state management
│   ├── color.ts      # Color lab state
│   └── project.ts    # Project/image state
└── utils/
    └── color-convert.ts  # RGB/CMYK/LAB conversion utilities
```

### Key Technical Details

**Build Output**:
- `dist/` - Vite/React build output
- `dist-electron/` - Electron main + preload (must output `main.js` and `preload.js`)
- `package.json` main entry: `dist-electron/main.js`

**IPC Communication**: Renderer uses `window.electronAPI` exposed via contextBridge in preload script. Never import Electron modules directly in renderer.

**State Management**: Zustand stores are used for cross-module state sharing. Image data imported in ColorLab is shared with CrossPreview and PrintAdapter via `project.ts` store.

**Image Display**: Canvas elements use `object-fit: contain` and calculated display dimensions to handle images of any size without overflow.

## Important Notes

- Ant Design CSS must be imported: `import 'antd/dist/reset.css'` in `main.tsx`
- ImageData objects require `colorSpace: 'srgb'` property when created manually
- Module switching is controlled via `activeModule` state in App.tsx using a switch statement
