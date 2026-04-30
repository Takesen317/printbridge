/**
 * Image utility functions
 * 图像处理公共工具函数
 */

// Maximum allowed image dimension in pixels
export const MAX_IMAGE_DIMENSION = 8192

// Maximum allowed total pixels (about 50 megapixels)
export const MAX_IMAGE_PIXELS = 50_000_000

/**
 * Validate image dimensions
 * Returns validation result with suggested scale factor if invalid
 */
export function validateImageDimensions(
  width: number,
  height: number
): { valid: boolean; suggestedScale?: number; reason?: string } {
  if (width <= 0 || height <= 0) {
    return { valid: false, reason: 'Image dimensions must be positive' }
  }

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    const maxDim = Math.max(width, height)
    const scale = MAX_IMAGE_DIMENSION / maxDim
    return {
      valid: false,
      suggestedScale: scale,
      reason: `Image dimension ${maxDim} exceeds maximum of ${MAX_IMAGE_DIMENSION}px`
    }
  }

  const totalPixels = width * height
  if (totalPixels > MAX_IMAGE_PIXELS) {
    const scale = Math.sqrt(MAX_IMAGE_PIXELS / totalPixels)
    return {
      valid: false,
      suggestedScale: scale,
      reason: `Image has ${totalPixels.toLocaleString()} pixels, exceeds maximum of ${MAX_IMAGE_PIXELS.toLocaleString()}`
    }
  }

  return { valid: true }
}

/**
 * Convert various ImageData-like objects to a real ImageData instance
 * 处理 Zustand store 中可能序列化的 ImageData 对象
 */
export function toRealImageData(obj: unknown): ImageData | null {
  if (obj instanceof ImageData) return obj
  if (obj !== null && typeof obj === 'object' && 'width' in obj && 'height' in obj && 'data' in obj) {
    const o = obj as { width: number; height: number; data: Uint8ClampedArray }
    if (o.data instanceof Uint8ClampedArray) {
      const data = new Uint8ClampedArray(o.data)
      return new ImageData(data, o.width, o.height)
    }
  }
  return null
}

/**
 * Clone an ImageData object
 * 克隆 ImageData 对象
 */
export function cloneImageData(imageData: ImageData): ImageData {
  return new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  )
}

/**
 * Sample edge pixels and calculate color variance
 * Used for bleed detection
 */
export function calculateEdgeVariance(imageData: ImageData, sampleCount: number = 20): number {
  const { width, height, data } = imageData

  const edgeColors: number[] = []

  // Sample top edge
  for (let x = 0; x < width && edgeColors.length < sampleCount; x += Math.max(1, Math.floor(width / sampleCount))) {
    const idx = x * 4
    edgeColors.push(data[idx], data[idx + 1], data[idx + 2])
  }

  // Sample bottom edge
  for (let x = 0; x < width && edgeColors.length < sampleCount * 2; x += Math.max(1, Math.floor(width / sampleCount))) {
    const idx = ((height - 1) * width + x) * 4
    edgeColors.push(data[idx], data[idx + 1], data[idx + 2])
  }

  // Sample left edge
  for (let y = 0; y < height && edgeColors.length < sampleCount * 3; y += Math.max(1, Math.floor(height / sampleCount))) {
    const idx = (y * width) * 4
    edgeColors.push(data[idx], data[idx + 1], data[idx + 2])
  }

  // Sample right edge
  for (let y = 0; y < height && edgeColors.length < sampleCount * 4; y += Math.max(1, Math.floor(height / sampleCount))) {
    const idx = (y * width + width - 1) * 4
    edgeColors.push(data[idx], data[idx + 1], data[idx + 2])
  }

  // Calculate variance
  if (edgeColors.length < 3) return 0

  let rSum = 0, gSum = 0, bSum = 0
  for (let i = 0; i < edgeColors.length; i += 3) {
    rSum += edgeColors[i]
    gSum += edgeColors[i + 1]
    bSum += edgeColors[i + 2]
  }
  const rMean = rSum / (edgeColors.length / 3)
  const gMean = gSum / (edgeColors.length / 3)
  const bMean = bSum / (edgeColors.length / 3)

  let variance = 0
  for (let i = 0; i < edgeColors.length; i += 3) {
    variance += Math.pow(edgeColors[i] - rMean, 2)
    variance += Math.pow(edgeColors[i + 1] - gMean, 2)
    variance += Math.pow(edgeColors[i + 2] - bMean, 2)
  }

  return Math.sqrt(variance / edgeColors.length)
}

/**
 * Sample pixels from image for color analysis
 * Grid-based sampling for representative color analysis
 */
export function sampleImagePixels(
  imageData: ImageData,
  gridSize: number = 5
): { r: number; g: number; b: number; x: number; y: number }[] {
  const { width, height, data } = imageData
  const samples: { r: number; g: number; b: number; x: number; y: number }[] = []

  const cellWidth = width / gridSize
  const cellHeight = height / gridSize

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Sample from center of each grid cell
      const cx = Math.floor(col * cellWidth + cellWidth / 2)
      const cy = Math.floor(row * cellHeight + cellHeight / 2)
      const idx = (cy * width + cx) * 4

      samples.push({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
        x: cx,
        y: cy
      })
    }
  }

  return samples
}
