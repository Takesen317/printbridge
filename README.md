# PrintBridge

> A desktop app for bridging digital design previews and print-oriented color checks

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-v28.3.3-47848F.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)

PrintBridge is a course project focused on helping designers and print learners compare screen content with likely print constraints. It combines color analysis, cross-media preview, print preflight checks, and learning resources in a single Electron desktop app.

## Primary Workflow

The current baseline workflow is:

1. Open `Color Lab` and import an image.
2. Review `Analyze` and `Preview` states inside Color Lab.
3. Switch to `Cross-Media Preview` to compare simulated output under different viewing conditions.
4. Switch to `Smart Print Adapter` to run heuristic print-readiness checks.

The verified keyboard-shortcut baseline for this workflow currently covers `Control+1`, `Control+2`, and `Control+3` on the current Windows/Linux shell path.

Baseline readable workflow labels are documented in [src/renderer/constants/copy.ts](/G:/GitHub/printbridge/printbridge-master/printbridge-master/src/renderer/constants/copy.ts). This file is a documentation/reference baseline for the convergence work in Task 1, not the enforced runtime source of truth for every renderer label yet.

## What It Does

- `Color Lab`
  Import an image, inspect representative colors, review approximate RGB-to-CMYK conversion results, and preview soft-proof style output.
- `Cross-Media Preview`
  Explore viewing-condition differences such as light source and presentation context.
- `Smart Print Adapter`
  Run heuristic checks for resolution, probable out-of-gamut colors, suspected missing bleed, and likely RGB workflow risks.
- `Knowledge Hub`
  Present reference material, demos, and learning-oriented content for the project presentation.

## Important Accuracy Notes

- ICC-based analysis is available only when the LittleCMS WASM engine initializes successfully.
- Some checks are heuristic approximations rather than production-grade prepress validation.
- AI color advice uses DeepSeek when an API key is configured; otherwise it falls back to a rule-based demo path.

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

For the core workflow browser smoke test:

```bash
npx playwright test tests/e2e/app.spec.ts --project=chromium
```

The smoke coverage currently verifies the readable shell path across:

1. `Color Lab`
2. `Cross-Media Preview`
3. `Smart Print Adapter`
4. back to `Color Lab`

Additional baseline docs:

- [Known limitations](/G:/GitHub/printbridge/printbridge-master/printbridge-master/docs/known-limitations.md)
- [Session model](/G:/GitHub/printbridge/printbridge-master/printbridge-master/docs/architecture/session-model.md)

## Environment

Create `.env` from `.env.example` if you want to enable the DeepSeek-backed AI advice path:

```bash
cp .env.example .env
```

```env
VITE_DEEPSEEK_API_KEY=your_api_key_here
```

If no API key is present, the app still works and uses its built-in rule-based demo logic for AI advice.

## Deliverables

- Source code for the desktop application
- Architecture diagrams in [docs/diagrams](./docs/diagrams)
- Unit and E2E test scaffolding for course demonstration

## License

MIT
