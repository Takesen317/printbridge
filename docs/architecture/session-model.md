# Session Model

This document defines the current session baseline for the core workflow.

## Session scope

A session starts when the renderer loads and ends when the app window closes or the renderer is refreshed.

Within a session, the user moves through three primary workflow modules:

1. `Color Lab`
2. `Cross-Media Preview`
3. `Smart Print Adapter`

## Active state

- The renderer tracks the active module in app state.
- The current verified baseline covers `Control+1`, `Control+2`, and `Control+3` on the Windows/Linux shell path for the first three workflow destinations.
- Menu actions that import or export an image force the session back to `Color Lab`.

## Working data

- Imported image data is stored in the renderer state and reused across modules.
- Derived preview output is generated from the imported image plus the current viewing-condition settings.
- Print-readiness checks read the current imported image and local form settings such as target paper size.

## Persisted workflow fields

The current `.pbp` project payload persists the workflow context below:

- `projectName`
- `processingOptions`
- `activeProfile`
- `analysis`
- `aiAdvice`
- `lastViewMode`
- `exportFormat`
- `exportSource`
- `aiTargetUse`
- `softProofEnabled`

## Restore behavior

- Loading a project restores the saved image payload into both `originalImage` and `processedImage`.
- Processing options are restored by merging persisted values over the current default options, so missing keys fall back safely.
- The saved workflow context restores the last active view mode, export settings, AI target use, active profile, analysis result, and soft-proof state.
- Resetting the project clears both project session state and color-session state back to their defaults.

## Persistence expectations

- Renderer stores use persisted Zustand state for project and theme data.
- This baseline does not guarantee cross-version session compatibility or durable project history.
- The documentation baseline intentionally describes current behavior only; it does not define future synchronization or collaboration semantics.
