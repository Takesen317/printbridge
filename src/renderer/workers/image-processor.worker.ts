/**
 * Web Worker for heavy image processing tasks
 * Runs color conversion and soft-proof simulation off the main thread
 */

import { rgbToCmyk, cmykToRgb, applyLightSource, getSharpnessFactor } from '../utils/color-convert'

// Message types
export interface WorkerMessage {
  type: 'process'
  imageData: ImageDataTransfer
  options: WorkerProcessOptions
}

export interface WorkerResponse {
  type: 'result' | 'error' | 'progress'
  result?: ImageDataTransfer
  error?: string
  progress?: number
}

export interface ImageDataTransfer {
  width: number
  height: number
  data: Uint8ClampedArray
  colorSpace?: string
}

export interface WorkerProcessOptions {
  colorMode: 'rgb' | 'cmyk'
  resolution: number
  paperType: 'coated' | 'uncoated' | 'newsprint'
  simulateViewingConditions: boolean
  viewingDistance: number
  lightSource: 'D50' | 'D65' | 'F'
  /** 出血设置 (mm) - 用于在预览中显示裁切线和出血标记 */
  bleedMm?: number
}

function processImage(imageData: ImageDataTransfer, options: WorkerProcessOptions): ImageDataTransfer {
  const { width, height, data } = imageData

  // Optimized parameters: less aggressive adjustments for performance
  const saturationAdjust = options.paperType === 'newsprint' ? 0.75 :
                           options.paperType === 'uncoated' ? 0.88 : 0.95
  const contrastAdjust = options.paperType === 'newsprint' ? 1.08 :
                          options.paperType === 'uncoated' ? 1.03 : 1.0

  // Reduce blur radius for performance - max 2 instead of 3
  const sharpnessFactor = getSharpnessFactor(options.viewingDistance, options.resolution)
  const blurRadius = Math.max(0, Math.round((1 - sharpnessFactor) * 2))

  const outputData = new Uint8ClampedArray(data.length)

  // Apply color conversion first (RGB -> CMYK -> RGB with adjustments)
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i]
    let g = data[i + 1]
    let b = data[i + 2]
    const a = data[i + 3]

    ;[r, g, b] = applyLightSource(r, g, b, options.lightSource)

    const cmyk = rgbToCmyk({ r, g, b }, options.paperType)
    const newRgb = cmykToRgb(cmyk, options.paperType)
    const newR = newRgb.r * saturationAdjust
    const newG = newRgb.g * saturationAdjust
    const newB = newRgb.b * saturationAdjust

    outputData[i] = Math.min(255, Math.max(0, Math.round(((newR / 255 - 0.5) * contrastAdjust + 0.5) * 255)))
    outputData[i + 1] = Math.min(255, Math.max(0, Math.round(((newG / 255 - 0.5) * contrastAdjust + 0.5) * 255)))
    outputData[i + 2] = Math.min(255, Math.max(0, Math.round(((newB / 255 - 0.5) * contrastAdjust + 0.5) * 255)))
    outputData[i + 3] = a
  }

  // If blur is needed, use optimized single-pass box blur (only if blurRadius > 1)
  if (blurRadius > 1) {
    const tempData = new Uint8ClampedArray(outputData)

    // Use row-based blur instead of full 2D blur for performance
    // This is a separable approximation that's much faster
    for (let y = 0; y < height; y++) {
      const rowStart = y * width * 4
      for (let x = 0; x < width; x++) {
        const idx = rowStart + x * 4

        let rSum = 0, gSum = 0, bSum = 0, count = 0

        // Only sample a subset of neighbors for performance (3x3 instead of full blur)
        const step = Math.max(1, blurRadius - 1)
        for (let dy = -step; dy <= step; dy += step) {
          for (let dx = -step; dx <= step; dx += step) {
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

        if (count > 0) {
          outputData[idx] = Math.round(rSum / count)
          outputData[idx + 1] = Math.round(gSum / count)
          outputData[idx + 2] = Math.round(bSum / count)
        }
      }
    }
  }

  return {
    width,
    height,
    data: outputData
  }
}

// Worker message handler
self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, imageData, options } = e.data

  if (type !== 'process') return

  try {
    // Report progress
    self.postMessage({ type: 'progress', progress: 0 } as WorkerResponse)

    // Process the image
    const result = processImage(imageData, options)

    self.postMessage({ type: 'result', result } as WorkerResponse)
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as WorkerResponse)
  }
}