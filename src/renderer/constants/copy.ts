export const CORE_WORKFLOW_COPY = {
  colorLab: {
    title: 'Color Lab',
    description: 'Import an image, inspect representative color shifts, and preview a soft-proof style output.',
    views: {
      import: 'Import',
      analyze: 'Analyze',
      preview: 'Preview'
    },
    importCardTitle: 'Import image',
    chooseFile: 'Choose file'
  },
  crossPreview: {
    title: 'Cross-Media Preview',
    description: 'Compare on-screen content with simulated print-style output under different viewing conditions.',
    refreshAction: 'Refresh preview'
  },
  printAdapter: {
    title: 'Smart Print Adapter',
    description: 'Run heuristic print-readiness checks for resolution, gamut risk, color workflow, and likely bleed issues.',
    runChecksAction: 'Run checks'
  },
  knowledgeHub: {
    title: 'Knowledge Hub'
  }
} as const
