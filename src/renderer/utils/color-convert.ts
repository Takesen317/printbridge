import chroma from 'chroma-js'

export type ColorMode = 'rgb' | 'cmyk' | 'pantone'
export type PaperType = 'coated' | 'uncoated' | 'newsprint'

export interface RGB {
  r: number  // 0-255
  g: number
  b: number
}

export interface CMYK {
  c: number  // 0-100
  m: number
  y: number
  k: number
}

export interface LAB {
  l: number  // 0-100
  a: number  // -128 to 127
  b: number  // -128 to 127
}

/**
 * Paper type gamut boundaries for LAB color space
 * These define the usable color ranges for different paper types
 * - coated: widest gamut, minimal ink limiting
 * - uncoated: medium gamut, moderate ink limiting
 * - newsprint: narrowest gamut, significant ink limiting
 */
const PAPER_GAMUT_BOUNDS: Record<PaperType, { minL: number; maxL: number; maxC: number }> = {
  coated:    { minL: 5,  maxL: 95, maxC: 150 },
  uncoated:  { minL: 8,  maxL: 92, maxC: 120 },
  newsprint: { minL: 10, maxL: 88, maxC: 85 }
}

/**
 * Ink limiting factors for different paper types
 * Newsprint has significant limiting due to paper absorbency
 */
const INK_LIMIT_FACTORS: Record<PaperType, number> = {
  coated:    1.00,
  uncoated:  0.95,
  newsprint: 0.85
}

/**
 * Clamp LAB values to paper-type gamut boundaries
 * This ensures colors are within the reproducible range for the target paper
 */
function clampToPaperGamut(lab: LAB, paperType: PaperType): LAB {
  const bounds = PAPER_GAMUT_BOUNDS[paperType]

  // Calculate chroma from a, b
  const chroma2 = lab.a * lab.a + lab.b * lab.b
  const chroma = Math.sqrt(chroma2)

  // Clamp lightness
  const L = Math.max(bounds.minL, Math.min(bounds.maxL, lab.l))

  // Clamp chroma if out of bounds
  let a = lab.a
  let b = lab.b
  if (chroma > bounds.maxC && chroma > 0) {
    const scale = bounds.maxC / chroma
    a *= scale
    b *= scale
  }

  return { l: L, a, b }
}

// RGB to CMYK 转换 (通过 LAB 中间色彩空间进行更准确的转换)
export function rgbToCmyk(rgb: RGB, paperType: PaperType = 'coated'): CMYK {
  // 边缘情况：纯白色 (不需要转换)
  if (rgb.r === 255 && rgb.g === 255 && rgb.b === 255) {
    return { c: 0, m: 0, y: 0, k: 0 }
  }

  // 边缘情况：纯黑色
  if (rgb.r === 0 && rgb.g === 0 && rgb.b === 0) {
    return { c: 0, m: 0, y: 0, k: 100 }
  }

  // 通过 LAB 空间进行更准确的色域映射
  const lab = rgbToLab(rgb)

  // 根据纸张类型限制色域
  const clampedLab = clampToPaperGamut(lab, paperType)

  // 转回 RGB
  const clampedRgb = labToRgb(clampedLab)

  // 使用 K-based 方法计算 CMYK
  const r = clampedRgb.r / 255
  const g = clampedRgb.g / 255
  const b = clampedRgb.b / 255

  const k = 1 - Math.max(r, g, b)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }

  // 应用纸张类型的墨水限制
  const inkLimit = INK_LIMIT_FACTORS[paperType]
  const effectiveK = Math.min(k, inkLimit)

  // 重新计算 CMY
  const c = (1 - r - effectiveK) / (1 - effectiveK) * 100
  const m = (1 - g - effectiveK) / (1 - effectiveK) * 100
  const y = (1 - b - effectiveK) / (1 - effectiveK) * 100

  return {
    c: Math.round(Math.min(100, Math.max(0, c))),
    m: Math.round(Math.min(100, Math.max(0, m))),
    y: Math.round(Math.min(100, Math.max(0, y))),
    k: Math.round(effectiveK * 100)
  }
}

// CMYK to RGB 转换 (通过 LAB 中间色彩空间进行更准确的转换)
export function cmykToRgb(cmyk: CMYK, paperType: PaperType = 'coated'): RGB {
  // 边缘情况：纯黑色
  if (cmyk.c === 0 && cmyk.m === 0 && cmyk.y === 0 && cmyk.k === 100) {
    return { r: 0, g: 0, b: 0 }
  }

  // 边缘情况：纯白色
  if (cmyk.c === 0 && cmyk.m === 0 && cmyk.y === 0 && cmyk.k === 0) {
    return { r: 255, g: 255, b: 255 }
  }

  // 先用标准公式转 RGB
  const r = 255 * (1 - cmyk.c / 100) * (1 - cmyk.k / 100)
  const g = 255 * (1 - cmyk.m / 100) * (1 - cmyk.k / 100)
  const b = 255 * (1 - cmyk.y / 100) * (1 - cmyk.k / 100)

  const rgb = { r: Math.round(r), g: Math.round(g), b: Math.round(b) }

  // 通过 LAB 空间确保色域对齐
  const lab = rgbToLab(rgb)
  const clampedLab = clampToPaperGamut(lab, paperType)

  return labToRgb(clampedLab)
}

// 计算色差 ΔE (CIE2000) - 使用 chroma-js
export function deltaE(rgb1: RGB, rgb2: RGB): number {
  const color1 = chroma(rgb1.r, rgb1.g, rgb1.b).hex()
  const color2 = chroma(rgb2.r, rgb2.g, rgb2.b).hex()
  return chroma.deltaE(color1, color2)
}

// RGB to LAB (使用 chroma-js)
export function rgbToLab(rgb: RGB): LAB {
  const [l, a, b] = chroma(rgb.r, rgb.g, rgb.b).lab()
  return { l, a, b }
}

// LAB to RGB 逆转换 (使用 chroma-js)
export function labToRgb(lab: LAB): RGB {
  const [r, g, b] = chroma.lab(lab.l, lab.a, lab.b).rgb()
  return {
    r: Math.round(Math.min(255, Math.max(0, r))),
    g: Math.round(Math.min(255, Math.max(0, g))),
    b: Math.round(Math.min(255, Math.max(0, b)))
  }
}

/**
 * 光源色温调整矩阵
 * D50 (5000K) - 印刷标准暖白色
 * D65 (6500K) - 标准日光冷白色
 * F (4000K) - 荧光灯偏绿
 */
export function applyLightSource(r: number, g: number, b: number, source: 'D50' | 'D65' | 'F'): [number, number, number] {
  let rMul = 1, gMul = 1, bMul = 1

  switch (source) {
    case 'D50': // 暖色调，偏黄
      rMul = 1.05
      gMul = 1.02
      bMul = 0.95
      break
    case 'D65': // 标准日光，中性
      rMul = 0.98
      gMul = 1.0
      bMul = 1.02
      break
    case 'F': // 荧光灯，偏绿
      rMul = 0.95
      gMul = 1.05
      bMul = 0.98
      break
  }

  return [
    Math.min(255, Math.max(0, Math.round(r * rMul))),
    Math.min(255, Math.max(0, Math.round(g * gMul))),
    Math.min(255, Math.max(0, Math.round(b * bMul)))
  ]
}

/**
 * 根据观察距离计算清晰度因子
 * 标准观察距离 250mm，低于这个距离应该更清晰，高于这个距离可以更模糊
 */
export function getSharpnessFactor(viewingDistance: number, resolution: number): number {
  // 基于距离的清晰度调整
  // 250mm 是标准距离，大于它图像会显得更模糊（需要降低清晰度因子）
  // 小于它图像会更清晰（需要提高清晰度因子）
  const distanceFactor = 250 / viewingDistance

  // 基于分辨率的清晰度调整
  // 300 DPI 是印刷标准，低于它会更模糊
  const resolutionFactor = resolution / 300

  // 结合两个因素
  const combinedFactor = distanceFactor * resolutionFactor

  // 限制范围：0.5 到 1.5
  return Math.max(0.5, Math.min(1.5, combinedFactor))
}
