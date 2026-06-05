import { deltaE, rgbToCmyk, type RGB } from '../utils/color-convert'
import { calculateEdgeVariance } from '../utils/image-utils'
import { formatPreflightDescription } from './preflight-messages'

export type ProblemType =
  | 'color-mode'
  | 'low-resolution'
  | 'missing-bleed'
  | 'fonts-not-embedded'
  | 'out-of-gamut'

export type ProblemConfidence = 'high' | 'medium' | 'low'
export type ProblemCategory = 'deterministic' | 'heuristic' | 'advisory'

export interface PrintProblem {
  type: ProblemType
  severity: 'error' | 'warning' | 'info'
  category: ProblemCategory
  confidence: ProblemConfidence
  title: string
  description: string
  location?: { x: number; y: number; width: number; height: number }
  suggestedFix?: string
}

export interface PrintCheckResult {
  problems: PrintProblem[]
  canPrint: boolean
  overallScore: number
  heuristicWarnings: number
  deterministicIssues: number
}

export interface PrintCheckOptions {
  minResolution?: number
  requiredBleed?: number
  paperSize?: 'A4' | 'A3' | 'A5' | 'custom'
  customWidthMm?: number
  customHeightMm?: number
  gamutThreshold?: number
}

interface SampleSummary {
  outOfGamutCount: number
  sampleCount: number
}

const PAPER_SIZES: Record<'A4' | 'A3' | 'A5', { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  A5: { width: 148, height: 210 }
}

const BLEED_VARIANCE_MIN = 10
const GAMUT_DELTA_E_THRESHOLD = 3

function resolvePaperSize(options: PrintCheckOptions): { width: number; height: number } {
  if (options.paperSize === 'custom' && options.customWidthMm && options.customHeightMm) {
    return { width: options.customWidthMm, height: options.customHeightMm }
  }

  return PAPER_SIZES[options.paperSize && options.paperSize !== 'custom' ? options.paperSize : 'A4']
}

function calculateDpi(imageWidth: number, imageHeight: number, options: PrintCheckOptions): number {
  const paper = resolvePaperSize(options)
  const dpiX = imageWidth / (paper.width / 25.4)
  const dpiY = imageHeight / (paper.height / 25.4)
  return Math.min(dpiX, dpiY)
}

function isOutOfGamut(color: RGB, threshold = GAMUT_DELTA_E_THRESHOLD): boolean {
  const cmyk = rgbToCmyk(color)
  if (cmyk.k >= 99) return false

  const k = cmyk.k / 100
  const c = cmyk.c / 100
  const m = cmyk.m / 100
  const y = cmyk.y / 100

  const r1 = Math.round((1 - c) * (1 - k) * 255)
  const g1 = Math.round((1 - m) * (1 - k) * 255)
  const b1 = Math.round((1 - y) * (1 - k) * 255)

  return deltaE(color, { r: r1, g: g1, b: b1 }) > threshold
}

function sampleOutOfGamut(imageData: ImageData, threshold: number): SampleSummary {
  const { width, height, data } = imageData
  const step = Math.max(5, Math.floor(Math.max(width, height) / 100))
  let outOfGamutCount = 0
  let sampleCount = 0

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4
      const color: RGB = { r: data[i], g: data[i + 1], b: data[i + 2] }
      sampleCount++
      if (isOutOfGamut(color, threshold)) {
        outOfGamutCount++
      }
    }
  }

  return { outOfGamutCount, sampleCount }
}

function checkBleed(imageData: ImageData): boolean {
  return calculateEdgeVariance(imageData, 30) > BLEED_VARIANCE_MIN
}

function detectColorMode(imageData: ImageData): 'rgb' | 'gray' {
  const { width, height, data } = imageData
  const totalPixels = width * height
  const sampleSize = Math.min(1000, totalPixels)
  const step = Math.max(1, Math.floor(totalPixels / sampleSize))

  let grayCount = 0
  let totalSaturation = 0
  let colorfulPixelCount = 0
  let sampledPixels = 0

  for (let i = 0; i < totalPixels; i += step) {
    const idx = i * 4
    const r = data[idx]
    const g = data[idx + 1]
    const b = data[idx + 2]

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    if (max - min < 10) grayCount++

    const saturation = max === 0 ? 0 : (max - min) / max
    totalSaturation += saturation
    if (saturation > 0.3 && max - min > 50) colorfulPixelCount++
    sampledPixels++
  }

  const avgSaturation = totalSaturation / sampledPixels
  const grayRatio = grayCount / sampledPixels
  const colorfulRatio = colorfulPixelCount / sampledPixels

  if (grayRatio > 0.95 || avgSaturation < 0.15) return 'gray'
  if (avgSaturation > 0.3 && colorfulRatio > 0.2) return 'rgb'
  return 'rgb'
}

export function checkPrintReadiness(imageData: ImageData, options: PrintCheckOptions = {}): PrintCheckResult {
  const problems: PrintProblem[] = []
  const minResolution = options.minResolution || 300
  const requiredBleed = options.requiredBleed || 3
  const gamutThreshold = options.gamutThreshold || GAMUT_DELTA_E_THRESHOLD

  const estimatedDpi = calculateDpi(imageData.width, imageData.height, options)
  if (estimatedDpi < minResolution) {
    problems.push({
      type: 'low-resolution',
      severity: 'error',
      category: 'deterministic',
      confidence: 'high',
      title: 'Resolution too low',
      description: formatPreflightDescription({
        category: 'deterministic',
        detail: `Estimated output resolution is about ${Math.round(estimatedDpi)} DPI, below the target ${minResolution} DPI.`
      }),
      suggestedFix: 'Use a higher-resolution source image or reduce the final print size.'
    })
  } else if (estimatedDpi < minResolution * 1.2) {
    problems.push({
      type: 'low-resolution',
      severity: 'warning',
      category: 'deterministic',
      confidence: 'high',
      title: 'Resolution is close to the minimum',
      description: formatPreflightDescription({
        category: 'deterministic',
        detail: `Estimated output resolution is about ${Math.round(estimatedDpi)} DPI, which is close to the target ${minResolution} DPI.`
      }),
      suggestedFix: 'Prepare a slightly higher-resolution image to reduce the risk of soft detail.'
    })
  }

  const { outOfGamutCount, sampleCount } = sampleOutOfGamut(imageData, gamutThreshold)
  const outOfGamutRatio = sampleCount === 0 ? 0 : outOfGamutCount / sampleCount
  const outOfGamutPercentage = outOfGamutRatio * 100

  if (outOfGamutCount > 0) {
    const ratioText = `${Math.round(outOfGamutPercentage * 10) / 10}% of sampled pixels`
    if (outOfGamutPercentage > 10) {
      problems.push({
        type: 'out-of-gamut',
        severity: 'error',
        category: 'heuristic',
        confidence: 'medium',
        title: 'High out-of-gamut risk',
        description: formatPreflightDescription({
          category: 'heuristic',
          confidence: 'medium',
          detail: `${ratioText} appear to exceed the target print gamut in the sampling pass.`
        }),
        suggestedFix: 'Reduce saturation in extreme color regions and check the result with soft proofing.'
      })
    } else if (outOfGamutPercentage > 1) {
      problems.push({
        type: 'out-of-gamut',
        severity: 'warning',
        category: 'heuristic',
        confidence: 'medium',
        title: 'Potential out-of-gamut colors detected',
        description: formatPreflightDescription({
          category: 'heuristic',
          confidence: 'medium',
          detail: `${ratioText} appear to exceed the target print gamut in the sampling pass.`
        }),
        suggestedFix: 'Review the most saturated areas and compare them under the selected ICC workflow.'
      })
    } else {
      problems.push({
        type: 'out-of-gamut',
        severity: 'info',
        category: 'heuristic',
        confidence: 'low',
        title: 'Minor gamut-edge activity',
        description: formatPreflightDescription({
          category: 'heuristic',
          confidence: 'low',
          detail: `${ratioText} may be close to or outside the target gamut according to the sampling heuristic.`
        }),
        suggestedFix: 'If those colors are visually critical, review them manually before export.'
      })
    }
  }

  if (!checkBleed(imageData)) {
    problems.push({
      type: 'missing-bleed',
      severity: 'warning',
      category: 'heuristic',
      confidence: 'low',
      title: 'Possible missing bleed',
      description: formatPreflightDescription({
        category: 'heuristic',
        confidence: 'low',
        detail: `Edge extension looks limited for the target bleed setting of ${requiredBleed}mm.`
      }),
      suggestedFix: 'Confirm that artwork extends beyond the trim line and that the layout includes the intended bleed.'
    })
  }

  const colorMode = detectColorMode(imageData)
  if (colorMode === 'rgb') {
    problems.push({
      type: 'color-mode',
      severity: 'warning',
      category: 'advisory',
      confidence: 'low',
      title: 'Image likely still follows an RGB workflow',
      description: formatPreflightDescription({
        category: 'advisory',
        confidence: 'low',
        detail: 'Pixel distribution suggests RGB-like content. This does not prove the embedded ICC metadata.'
      }),
      suggestedFix: 'Confirm the intended output profile and review the image under the target CMYK workflow if needed.'
    })
  } else {
    problems.push({
      type: 'color-mode',
      severity: 'info',
      category: 'advisory',
      confidence: 'low',
      title: 'Image appears low-saturation or grayscale-like',
      description: formatPreflightDescription({
        category: 'advisory',
        confidence: 'low',
        detail: 'The sampled pixel distribution suggests grayscale or low-saturation content.'
      }),
      suggestedFix: 'If the job is intended for full-color print, double-check the source color configuration.'
    })
  }

  const deterministicIssues = problems.filter((problem) => problem.category === 'deterministic' && problem.severity !== 'info').length
  const heuristicWarnings = problems.filter((problem) => problem.category === 'heuristic' && problem.severity !== 'info').length
  const errorCount = problems.filter((problem) => problem.severity === 'error').length
  const warningCount = problems.filter((problem) => problem.severity === 'warning').length
  const score = Math.max(0, 100 - errorCount * 30 - warningCount * 10)

  return {
    problems,
    canPrint: errorCount === 0,
    overallScore: score,
    heuristicWarnings,
    deterministicIssues
  }
}
