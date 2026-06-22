/**
 * Print problem fix actions
 * Implements actual fixes for print readiness problems detected by checkPrintReadiness
 */

import { useProjectStore } from '../../store/project'
import { useColorStore } from '../../store/color'
import type { PrintProblem } from '../../services/print-checker'

export function fixColorMode(): boolean {
  const store = useProjectStore.getState()
  store.updateProcessingOptions({ colorMode: 'cmyk' })
  return true
}

export function fixLowResolution(): boolean {
  const store = useProjectStore.getState()
  if (store.processingOptions.resolution < 300) {
    store.updateProcessingOptions({ resolution: 300 })
  }
  return true
}

export function fixMissingBleed(): boolean {
  console.warn('Missing bleed: please add 3mm bleed in your design software before exporting')
  return false
}

export function fixOutOfGamut(): boolean {
  const store = useProjectStore.getState()
  const colorStore = useColorStore.getState()

  colorStore.toggleSoftProof()
  colorStore.setWarningThreshold(5)
  store.updateProcessingOptions({ paperType: 'coated' })
  return true
}

export function fixFontsNotEmbedded(): boolean {
  console.warn('Font embedding requires export to PDF with embedded fonts')
  return false
}

const fixFunctionMap: Record<string, () => boolean> = {
  'color-mode': fixColorMode,
  'low-resolution': fixLowResolution,
  'missing-bleed': fixMissingBleed,
  'out-of-gamut': fixOutOfGamut,
  'fonts-not-embedded': fixFontsNotEmbedded,
}

export function applyFix(problem: PrintProblem): boolean {
  const fixFn = fixFunctionMap[problem.type]
  if (fixFn) {
    return fixFn()
  }
  return false
}

export function getFixDescription(problemType: string): string {
  switch (problemType) {
    case 'color-mode':
      return '已将颜色模式切换为 CMYK'
    case 'low-resolution':
      return '已将分辨率设为 300 DPI'
    case 'missing-bleed':
      return '请在设计软件中添加 3mm 出血'
    case 'out-of-gamut':
      return '已启用软打样并切换到涂布纸类型'
    case 'fonts-not-embedded':
      return '字体嵌入需要在导出 PDF 时完成'
    default:
      return '该问题无法自动修复'
  }
}
