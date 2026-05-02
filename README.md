# PrintBridge

> A cross-platform desktop application bridging digital media design and print engineering

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-v28.3.3-47848F.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6.svg)](https://www.typescriptlang.org/)

PrintBridge helps designers and print professionals manage color consistency across digital displays and print outputs through AI-powered color analysis and print preflight detection.

## Features

| Module | Description | AI Enhancement |
|--------|-------------|----------------|
| 🎨 **Color Lab** | ICC profile selection, RGB↔CMYK conversion, soft-proofing | AI-powered profile recommendation |
| 👁️ **Cross-Media Preview** | Multi-light source simulation (D50/D65/F), paper type preview | AI viewing condition optimization |
| 🖨️ **Smart Print Adapter** | Resolution, color mode, bleed, and gamut detection | AI-powered problem diagnosis |
| 📚 **Knowledge Hub** | Case library, interactive demos, quizzes | Personalized learning path |
| 🤖 **AI Color Advisor** | DeepSeek LLM powered color analysis | Deep learning powered |

## Tech Stack

- **Framework**: Electron 28.3.3 + React 18.2.0 + TypeScript 5.3.3
- **Build**: Vite 5 + electron-builder
- **UI**: Ant Design 5 + Zustand state management
- **Color Engine**: LittleCMS WASM
- **AI**: DeepSeek LLM API

## Prerequisites

- Node.js 18+
- Windows 10/11 x64 (for production build)

## Quick Start

### Clone and Install

```bash
git clone https://github.com/Takesen317/printbridge.git
cd printbridge
npm install
```

### Configure Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your DeepSeek API key:

```
VITE_DEEPSEEK_API_KEY=your_api_key_here
```

Get your API key at: https://platform.deepseek.com/

### Development

```bash
npm run dev
```

### Build

```bash
npm run build:win    # Windows installer + portable
npm run build:dir    # Build unpacked directory
```

Output: `release/win-unpacked/PrintBridge.exe`

## Project Structure

```
printbridge/
├── src/
│   ├── main/                 # Electron main process
│   ├── preload/             # Preload scripts
│   ├── renderer/            # React application
│   │   ├── modules/        # Feature modules
│   │   │   ├── color-lab/   # Color management
│   │   │   ├── cross-preview/ # Cross-media preview
│   │   │   ├── print-adapter/ # Print preflight
│   │   │   └── knowledge-hub/ # Learning resources
│   │   ├── services/       # Business logic
│   │   ├── hooks/          # React hooks
│   │   ├── store/          # Zustand state
│   │   └── utils/          # Utilities
│   └── shared/             # Shared types
├── docs/diagrams/          # Architecture diagrams
├── build/                  # Build resources
└── release/                 # Build output
```

## Documentation

Architecture diagrams and technical documentation are available in `docs/diagrams/`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Electron](https://www.electronjs.org/) - Cross-platform desktop framework
- [React](https://reactjs.org/) - UI library
- [Ant Design](https://ant.design/) - UI component library
- [LittleCMS](https://www.littlecms.com/) - Open source color management engine
- [DeepSeek](https://www.deepseek.com/) - AI language model support