# PrintBridge

> A desktop course project for comparing digital design previews with print-oriented checks.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-v28.3.3-47848F.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)

PrintBridge combines color analysis, cross-media preview, print preflight checks, and learning-oriented reference content in a single Electron desktop app.

## Submission Status

This repository is prepared for course inspection.

- Source code is included
- Documentation is included
- Unit tests and Playwright smoke tests are included
- A packaged Windows release is available in GitHub Releases

## Core Workflow

The main project workflow is:

1. Open `Color Lab` and import an image
2. Review `Analyze` and `Preview` states inside Color Lab
3. Switch to `Cross-Media Preview` to compare simulated output
4. Switch to `Smart Print Adapter` to review print-readiness checks
5. Save and restore the project session

## Modules

- `Color Lab`
  Import an image, inspect representative colors, review approximate RGB-to-CMYK conversion results, and preview soft-proof style output.
- `Cross-Media Preview`
  Compare simulated print-style output under different viewing conditions.
- `Smart Print Adapter`
  Run heuristic checks for resolution, gamut risk, color workflow, and likely bleed issues.
- `Knowledge Hub`
  Provide supporting reference material, demos, and course presentation content.

## Important Accuracy Notes

- ICC-based analysis depends on successful `lcms-wasm` initialization.
- Some print checks are heuristic approximations, not production-grade prepress validation.
- AI color advice uses DeepSeek when an API key is configured; otherwise it falls back to built-in rule-based guidance.

## Tech Stack

- Electron 28
- React 18
- TypeScript 5.9
- Vite 5
- Ant Design
- Zustand
- `lcms-wasm`
- `utif`
- Vitest
- Playwright

## Project Structure

```text
src/
  main/        Electron main process
  preload/     Secure renderer bridge
  renderer/    React application
  shared/      Shared types and constants
tests/
  unit/        Unit tests
  e2e/         Playwright smoke coverage
docs/
  diagrams/    Architecture and flow diagrams
```

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run test:run
npm run build
```

For the workflow smoke test:

```bash
npx playwright test tests/e2e/app.spec.ts --project=chromium
```

## Documentation

- [Known limitations](docs/known-limitations.md)
- [Session model](docs/architecture/session-model.md)
- [Architecture diagrams](docs/diagrams/)

## Environment

Create `.env` from `.env.example` if you want to enable DeepSeek-backed AI advice:

```bash
cp .env.example .env
```

```env
VITE_DEEPSEEK_API_KEY=your_api_key_here
```

If no API key is present, the app still works and uses built-in rule-based fallback advice.

## Release Artifact

The packaged Windows build is published through GitHub Releases.

Current release line:

- `v1.1.0`

## License

MIT
