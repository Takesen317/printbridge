import { rgbToCmyk, deltaE, RGB } from '../utils/color-convert'
import { calculateEdgeVariance } from '../utils/image-utils'

export type ProblemType =
  | 'color-mode'
  | 'low-resolution'
  | 'missing-bleed'
  | 'fonts-not-embedded'
  | 'out-of-gamut'

export interface PrintProblem {
  type: ProblemType
  severity: 'error' | 'warning' | 'info'
  title: string
  description: string
  location?: { x: number, y: number, width: number, height: number }
  suggestedFix?: string
}

export interface PrintCheckResult {
  problems: PrintProblem[]
  canPrint: boolean
  overallScore: number  // 0-100
}

export interface PrintCheckOptions {
  /** 最小分辨率 (DPI) */
  minResolution?: number
  /** 需要的出血量 (mm) */
  requiredBleed?: number
  /** 目标纸张尺寸 */
  paperSize?: 'A4' | 'A3' | 'A5' | 'custom'
  /** 自定义纸张宽度 (mm) - 当 paperSize 为 custom 时使用 */
  customWidthMm?: number
  /** 自定义纸张高度 (mm) - 当 paperSize 为 custom 时使用 */
  customHeightMm?: number
  /** 色域阈值 (ΔE) - 超过此值认为出界 */
  gamutThreshold?: number
}

const PAPER_SIZES: Record<string, { width: number; height: number }> = {
  'A4': { width: 210, height: 297 },
  'A3': { width: 297, height: 420 },
  'A5': { width: 148, height: 210 }
}

/**
 * Calculate DPI based on image dimensions and paper size
 */
function calculateDpi(imageWidth: number, imageHeight: number, options: PrintCheckOptions): number {
  const paperSize = options.paperSize || 'A4'
  const paper = PAPER_SIZES[paperSize]

  if (!paper) {
    // 默认使用 A4 尺寸
    return imageWidth / (210 / 25.4)
  }

  // 计算横向和纵向 DPI，取较小的
  const dpiX = imageWidth / (paper.width / 25.4)
  const dpiY = imageHeight / (paper.height / 25.4)

  return Math.min(dpiX, dpiY)
}

/**
 * Check if a single RGB color is out of CMYK gamut
 * Uses the RGB→CMYK→RGB round-trip method
 */
// 出血检测阈值：边缘颜色变化方差最小值，低于此值认为无出血
const BLEED_VARIANCE_MIN = 10
// 色域检测阈值：ΔE > 此值 认为超出 CMYK 色域
const GAMUT_DELTA_E_THRESHOLD = 3

function isOutOfGamut(color: RGB, threshold: number = 3): boolean {
  const cmyk = rgbToCmyk(color)
  // 转换回 RGB 比较色差
  const k = cmyk.k / 100
  const c = cmyk.c / 100
  const m = cmyk.m / 100
  const y = cmyk.y / 100

  // 往返转换的误差就是色域超出程度
  // 如果 K=100（纯黑）则不会出界
  if (cmyk.k >= 99) return false

  // 计算往返误差 ΔE (CIE2000)
  const r1 = Math.round((1 - c) * (1 - k) * 255)
  const g1 = Math.round((1 - m) * (1 - k) * 255)
  const b1 = Math.round((1 - y) * (1 - k) * 255)

  const dE = deltaE(color, { r: r1, g: g1, b: b1 })

  return dE > threshold
}

export function checkPrintReadiness(
  imageData: ImageData,
  options: PrintCheckOptions = {}
): PrintCheckResult {
  const problems: PrintProblem[] = []
  const minRes = options.minResolution || 300
  const bleed = options.requiredBleed || 3
  const gamutThreshold = options.gamutThreshold || GAMUT_DELTA_E_THRESHOLD

  // 1. 检查分辨率
  const estimatedDpi = calculateDpi(imageData.width, imageData.height, options)
  if (estimatedDpi < minRes) {
    problems.push({
      type: 'low-resolution',
      severity: 'error',
      title: '分辨率不足',
      description: `图像分辨率 ${Math.round(estimatedDpi)} DPI 低于印刷要求的 ${minRes} DPI`,
      suggestedFix: '请使用高分辨率源图像，或在印刷前进行超采样放大'
    })
  } else if (estimatedDpi < minRes * 1.2) {
    // 警告：分辨率接近最低要求
    problems.push({
      type: 'low-resolution',
      severity: 'warning',
      title: '分辨率接近下限',
      description: `图像分辨率 ${Math.round(estimatedDpi)} DPI 接近印刷要求 ${minRes} DPI`,
      suggestedFix: '建议使用更高分辨率的图像以确保印刷质量'
    })
  }

  // 2. 检查色域（使用采样以提高性能）
  const outOfGamutCount = checkOutOfGamut(imageData, gamutThreshold)
  const outOfGamutPercentage = (outOfGamutCount / (imageData.width * imageData.height)) * 100

  if (outOfGamutCount > 0) {
    if (outOfGamutPercentage > 10) {
      problems.push({
        type: 'out-of-gamut',
        severity: 'error',
        title: '大量颜色超出可印刷范围',
        description: `检测到 ${outOfGamutCount} 个像素 (${Math.round(outOfGamutPercentage)}%) 的颜色无法准确印刷`,
        suggestedFix: '请将鲜艳颜色替换为印刷色域内的等效颜色，或使用更广色域的印刷工艺'
      })
    } else if (outOfGamutPercentage > 1) {
      problems.push({
        type: 'out-of-gamut',
        severity: 'warning',
        title: '部分颜色超出可印刷范围',
        description: `检测到 ${outOfGamutCount} 个像素 (${Math.round(outOfGamutPercentage * 10) / 10}%) 的颜色超出印刷色域`,
        suggestedFix: '请检查高饱和度区域的色彩准确性'
      })
    } else {
      problems.push({
        type: 'out-of-gamut',
        severity: 'info',
        title: '少量颜色超出可印刷范围',
        description: `检测到 ${outOfGamutCount} 个像素的颜色超出印刷色域（ΔE > ${gamutThreshold}）`,
        suggestedFix: '在大多数情况下这些微小差异不会被注意'
      })
    }
  }

  // 3. 检查出血（使用边缘方差检测）
  const hasBleed = checkBleed(imageData, bleed)
  if (!hasBleed) {
    problems.push({
      type: 'missing-bleed',
      severity: 'warning',
      title: '缺少出血',
      description: `图像边缘未检测到足够的出血区域（需要约 ${bleed}mm）`,
      suggestedFix: '请在图像边缘添加至少 3mm 出血区域，并确保内容延伸到图像边缘'
    })
  }

  // 4. 检查色彩模式 (RGB vs CMYK)
  // 通过采样检测图像是否看起来像未转换的 RGB
  const colorMode = detectColorMode(imageData)
  if (colorMode === 'rgb') {
    problems.push({
      type: 'color-mode',
      severity: 'warning',
      title: '图像未转换为 CMYK',
      description: '检测到 RGB 色彩空间，印刷前建议转换为 CMYK 以确保色彩准确性',
      suggestedFix: '在色彩管理模块中使用 RGB→CMYK 转换'
    })
  } else if (colorMode === 'gray') {
    problems.push({
      type: 'color-mode',
      severity: 'info',
      title: '灰度图像',
      description: '检测到灰度图像，请确认印刷是否为单色印刷',
      suggestedFix: '如果需要彩色印刷，请使用 RGB 源文件'
    })
  }

  // 计算总分
  const errorCount = problems.filter(p => p.severity === 'error').length
  const warningCount = problems.filter(p => p.severity === 'warning').length
  const score = Math.max(0, 100 - errorCount * 30 - warningCount * 10)

  return {
    problems,
    canPrint: errorCount === 0,
    overallScore: score
  }
}

/**
 * Check for out-of-gamut pixels using sampling
 * Returns count of out-of-gamut pixels
 */
function checkOutOfGamut(imageData: ImageData, threshold: number): number {
  const { width, height, data } = imageData
  let count = 0

  // 采样间隔：图像越大采样间隔越大
  const step = Math.max(5, Math.floor(Math.max(width, height) / 100))

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4
      const color: RGB = {
        r: data[i],
        g: data[i + 1],
        b: data[i + 2]
      }

      if (isOutOfGamut(color, threshold)) {
        count++
      }
    }
  }

  return count
}

/**
 * Check for bleed using edge color variance
 * High variance on edges indicates content extending to the edge (has bleed)
 * Low variance indicates solid color edges (no bleed)
 * Note: bleedMm parameter reserved for future pixel-based bleed calculation
 */
function checkBleed(imageData: ImageData, _bleedMm?: number): boolean {
  // 出血阈值：根据 mm 转换为像素比例
  // 假设 300 DPI，3mm ≈ 35 像素
  // 边缘方差超过这个阈值说明有内容延伸
  const edgeVariance = calculateEdgeVariance(imageData, 30)

  // 方差阈值：经验值
  // 边缘颜色变化大说明有内容（出血良好）
  // 边缘颜色单一说明是纯色边框（没有出血）
  return edgeVariance > BLEED_VARIANCE_MIN
}

/**
 * Detect if an image appears to be in RGB, CMYK, or Grayscale color mode
 * This is an approximation since ImageData doesn't contain color space metadata
 * Uses statistical analysis of pixel values to infer the color mode
 */
function detectColorMode(imageData: ImageData): 'rgb' | 'cmyk' | 'gray' {
  const { width, height, data } = imageData
  const totalPixels = width * height

  // 采样数量（最多1000个采样点）
  const sampleSize = Math.min(1000, totalPixels)
  const step = Math.max(1, Math.floor(totalPixels / sampleSize))

  let highSaturationCount = 0
  let grayCount = 0
  let totalSaturation = 0
  let colorfulPixelCount = 0

  for (let i = 0; i < totalPixels; i += step) {
    const idx = i * 4
    const r = data[idx]
    const g = data[idx + 1]
    const b = data[idx + 2]

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)

    // 检测是否为灰度（RGB 值相近）
    if (max - min < 10) {
      grayCount++
    }

    // 计算饱和度
    const saturation = max === 0 ? 0 : (max - min) / max
    totalSaturation += saturation

    // 高饱和度像素（可能是鲜艳的 RGB 颜色）
    if (saturation > 0.5) {
      highSaturationCount++
    }

    // 鲜艳且 RGB 各分量差异大的像素（典型的未转换 RGB 图像特征）
    if (saturation > 0.3 && max - min > 50) {
      colorfulPixelCount++
    }
  }

  const avgSaturation = totalSaturation / sampleSize
  const grayRatio = grayCount / sampleSize
  const colorfulRatio = colorfulPixelCount / sampleSize

  // 启发式判断：
  // - 灰度图像：大部分像素是灰度
  if (grayRatio > 0.95) {
    return 'gray'
  }

  // - 如果平均饱和度高，且有大量鲜艳像素，认为是未转换的 RGB
  if (avgSaturation > 0.3 && colorfulRatio > 0.2) {
    return 'rgb'
  }

  // - 如果饱和度低，可能是灰度或已转换的 CMYK（通常饱和度较低）
  if (avgSaturation < 0.15) {
    return 'gray'
  }

  // 默认为 RGB（更常见）
  return 'rgb'
}
