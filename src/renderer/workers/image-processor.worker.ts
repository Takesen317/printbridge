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

  // Match the main-thread simulation so preview behavior is consistent across UI surfaces.
  const saturationAdjust = options.paperType === 'newsprint' ? 0.7 :
                           options.paperType === 'uncoated' ? 0.85 : 0.95
  const contrastAdjust = options.paperType === 'newsprint' ? 1.1 :
                          options.paperType === 'uncoated' ? 1.05 : 1.0

  const sharpnessFactor = getSharpnessFactor(options.viewingDistance, options.resolution)
  const blurRadius = Math.max(0, Math.round((1 - sharpnessFactor) * 3))

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

  // Apply blur when sharpness drops enough to make print softness perceptible.
  if (blurRadius > 0) {
    const tempData = new Uint8ClampedArray(outputData)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4

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

        outputData[idx] = Math.round(rSum / count)
        outputData[idx + 1] = Math.round(gSum / count)
        outputData[idx + 2] = Math.round(bSum / count)
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
