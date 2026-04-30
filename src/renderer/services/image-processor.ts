import { rgbToCmyk, cmykToRgb, applyLightSource, getSharpnessFactor } from '../utils/color-convert'
import type { PaperType } from '../utils/color-convert'

export interface ImageProcessorOptions {
  colorMode: 'rgb' | 'cmyk'
  resolution: number  // dpi
  paperType: PaperType
  simulateViewingConditions: boolean
  viewingDistance: number  // mm
  lightSource: 'D50' | 'D65' | 'F'
  /** 出血设置 (mm) - 用于在预览中显示裁切线和出血标记 */
  bleedMm?: number
}

export interface ProcessingResult {
  originalBuffer: Uint8Array
  processedBuffer: Uint8Array
  metadata: {
    width: number
    height: number
    colorMode: string
    resolution: number
  }
}

/**
 * 模拟印刷预览效果
 *
 * 使用 LAB 中间色彩空间进行 RGB↔CMYK 转换，以获得更准确的颜色保真度
 * 根据纸张类型进行色域限制和墨水量调整
 *
 * @param imageData - 原始图像数据
 * @param options - 处理选项
 * @returns 模拟印刷效果的图像数据
 */

// 模拟印刷预览效果
export function simulatePrintPreview(
  imageData: ImageData,
  options: ImageProcessorOptions
): ImageData {
  const { width, height, data } = imageData

  const output: ImageData = {
    width,
    height,
    data: new Uint8ClampedArray(data.length),
    colorSpace: 'srgb'
  } as ImageData

  // 纸张材质 - 饱和度和对比度 (与 LAB 转换配合使用)
  const saturationAdjust = options.paperType === 'newsprint' ? 0.7 :
                           options.paperType === 'uncoated' ? 0.85 : 0.95
  const contrastAdjust = options.paperType === 'newsprint' ? 1.1 :
                          options.paperType === 'uncoated' ? 1.05 : 1.0

  // 获取清晰度因子
  const sharpnessFactor = getSharpnessFactor(options.viewingDistance, options.resolution)

  // 预计算模糊半径（如果需要）
  const blurRadius = Math.max(0, Math.round((1 - sharpnessFactor) * 3))

  // 创建输出数据数组
  const outputData = output.data

  // 如果需要模糊，使用简单的box blur
  if (blurRadius > 0) {
    // 先应用所有颜色转换到临时数组
    const tempData = new Uint8ClampedArray(data.length)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4

        let r = data[idx]
        let g = data[idx + 1]
        let b = data[idx + 2]
        const a = data[idx + 3]

        // 应用光源
        ;[r, g, b] = applyLightSource(r, g, b, options.lightSource)

        // RGB to CMYK to RGB 转换 (使用 LAB 中间转换 + 纸张类型)
        const cmyk = rgbToCmyk({ r, g, b }, options.paperType)
        const newRgb = cmykToRgb(cmyk, options.paperType)

        const newR = newRgb.r * saturationAdjust
        const newG = newRgb.g * saturationAdjust
        const newB = newRgb.b * saturationAdjust

        // 应用对比度
        tempData[idx] = Math.min(255, Math.max(0, Math.round(((newR / 255 - 0.5) * contrastAdjust + 0.5) * 255)))
        tempData[idx + 1] = Math.min(255, Math.max(0, Math.round(((newG / 255 - 0.5) * contrastAdjust + 0.5) * 255)))
        tempData[idx + 2] = Math.min(255, Math.max(0, Math.round(((newB / 255 - 0.5) * contrastAdjust + 0.5) * 255)))
        tempData[idx + 3] = a
      }
    }

    // 应用box blur
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let rSum = 0, gSum = 0, bSum = 0, count = 0

        for (let dy = -blurRadius; dy <= blurRadius; dy++) {
          for (let dx = -blurRadius; dx <= blurRadius; dx++) {
            const nx = x + dx
            const ny = y + dy
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = (ny * width + nx) * 4
              rSum += tempData[nidx]
              gSum += tempData[nidx + 1]
              bSum += tempData[nidx + 2]
              count++
            }
          }
        }

        const idx = (y * width + x) * 4
        outputData[idx] = Math.round(rSum / count)
        outputData[idx + 1] = Math.round(gSum / count)
        outputData[idx + 2] = Math.round(bSum / count)
        outputData[idx + 3] = tempData[idx + 3]
      }
    }
  } else {
    // 不需要模糊，直接处理
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i]
      let g = data[i + 1]
      let b = data[i + 2]
      const a = data[i + 3]

      // 应用光源
      ;[r, g, b] = applyLightSource(r, g, b, options.lightSource)

      // RGB to CMYK to RGB 转换 (使用 LAB 中间转换 + 纸张类型)
      const cmyk = rgbToCmyk({ r, g, b }, options.paperType)
      const newRgb = cmykToRgb(cmyk, options.paperType)

      const newR = newRgb.r * saturationAdjust
      const newG = newRgb.g * saturationAdjust
      const newB = newRgb.b * saturationAdjust

      // 应用对比度
      outputData[i] = Math.min(255, Math.max(0, Math.round(((newR / 255 - 0.5) * contrastAdjust + 0.5) * 255)))
      outputData[i + 1] = Math.min(255, Math.max(0, Math.round(((newG / 255 - 0.5) * contrastAdjust + 0.5) * 255)))
      outputData[i + 2] = Math.min(255, Math.max(0, Math.round(((newB / 255 - 0.5) * contrastAdjust + 0.5) * 255)))
      outputData[i + 3] = a
    }
  }

  return output
}
