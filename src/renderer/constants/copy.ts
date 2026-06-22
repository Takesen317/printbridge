export const CORE_WORKFLOW_COPY = {
  colorLab: {
    title: 'Color Lab',
    description: {
      'zh-CN': '导入图像，检查代表性色彩偏移，并预览软打样风格输出。',
      'en-US': 'Import an image, inspect representative color shifts, and preview a soft-proof style output.'
    },
    views: {
      import: { 'zh-CN': '导入', 'en-US': 'Import' },
      analyze: { 'zh-CN': '分析', 'en-US': 'Analyze' },
      preview: { 'zh-CN': '预览', 'en-US': 'Preview' }
    },
    importCardTitle: { 'zh-CN': '导入图像', 'en-US': 'Import image' },
    chooseFile: { 'zh-CN': '选择文件', 'en-US': 'Choose file' }
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
