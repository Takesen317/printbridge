# Known Limitations

This baseline documents the current limits of the core PrintBridge workflow so copy, docs, and tests can converge before broader UI cleanup.

## Core workflow

- The primary verified workflow currently covers `Color Lab`, `Cross-Media Preview`, and `Smart Print Adapter`.
- Some surrounding shell text still uses legacy or garbled labels outside that baseline.
- `src/renderer/constants/copy.ts` is currently a baseline reference for intended readable labels, but renderer pages still contain hardcoded text and can drift until those labels are wired through runtime code.
- Keyboard shortcut coverage is limited to `Control+1`, `Control+2`, and `Control+3` on the current Windows/Linux shell path.

## Print and color accuracy

- ICC-based color analysis depends on the `lcms-wasm` engine initializing successfully.
- Several print-readiness checks are heuristic and should not be treated as production prepress validation.
- Preview output is an approximation of print conditions, not a contract for device-specific press results.

## Environment and integrations

- AI color advice requires `VITE_DEEPSEEK_API_KEY`; without it the app uses built-in rule-based fallback guidance.
- Rule-based fallback advice must remain explicitly labeled as approximate guidance and must not be presented as a live model response.
- Playwright end-to-end execution depends on a working local browser runtime and the Vite dev server starting correctly in the current environment.
