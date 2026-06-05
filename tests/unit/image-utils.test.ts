import { describe, it, expect } from 'vitest'
import { toRealImageData, cloneImageData, calculateEdgeVariance, sampleImagePixels } from '../../src/renderer/utils/image-utils'

describe('image-utils', () => {
  // Helper to create a small test ImageData
  const createTestImageData = (): ImageData => {
    const data = new Uint8ClampedArray(4 * 4 * 4) // 4x4 image, RGBA
    // Fill with a gradient pattern
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const idx = (y * 4 + x) * 4
        data[idx] = x * 64        // R
        data[idx + 1] = y * 64    // G
        data[idx + 2] = 128       // B
        data[idx + 3] = 255       // A
      }
    }
    return new ImageData(data, 4, 4)
  }

  describe('toRealImageData', () => {
    it('returns ImageData unchanged', () => {
      const original = createTestImageData()
      const result = toRealImageData(original)
      expect(result).toBe(original)
    })

    it('converts valid plain object to ImageData', () => {
      const data = new Uint8ClampedArray(4 * 4 * 4)
      const obj = { width: 4, height: 4, data }
      const result = toRealImageData(obj)
      expect(result).not.toBeNull()
      expect(result?.width).toBe(4)
      expect(result?.height).toBe(4)
    })

    it('returns null for null', () => {
      const result = toRealImageData(null)
      expect(result).toBeNull()
    })

    it('returns null for undefined', () => {
      const result = toRealImageData(undefined)
      expect(result).toBeNull()
    })

    it('returns null for non-ImageData objects without required properties', () => {
      const result = toRealImageData({ foo: 'bar' })
      expect(result).toBeNull()
    })

    it('returns null for objects with wrong data type', () => {
      const obj = { width: 4, height: 4, data: 'not-an-array' }
      const result = toRealImageData(obj)
      expect(result).toBeNull()
    })
  })

  describe('cloneImageData', () => {
    it('creates a new ImageData with same dimensions and data', () => {
      const original = createTestImageData()
      const clone = cloneImageData(original)

      expect(clone.width).toBe(original.width)
      expect(clone.height).toBe(original.height)
      expect(clone.data.length).toBe(original.data.length)

      for (let i = 0; i < original.data.length; i++) {
        expect(clone.data[i]).toBe(original.data[i])
      }
    })

    it('returns a different object reference', () => {
      const original = createTestImageData()
      const clone = cloneImageData(original)
      expect(clone).not.toBe(original)
      expect(clone.data).not.toBe(original.data)
    })

    it('modifying clone does not affect original', () => {
      const original = createTestImageData()
      const clone = cloneImageData(original)

      // Modify clone
      clone.data[0] = 255

      // Original should be unchanged
      expect(original.data[0]).not.toBe(255)
    })
  })

  describe('calculateEdgeVariance', () => {
    it('returns low variance for uniform edge image', () => {
      // Create image with fully uniform edge (all edges same color)
      const data = new Uint8ClampedArray(10 * 10 * 4)
      // Fill entire image with red
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255       // R
        data[i + 1] = 0     // G
        data[i + 2] = 0     // B
        data[i + 3] = 255   // A
      }
      const img = new ImageData(data, 10, 10)
      const result = calculateEdgeVariance(img, 20)
      // All edge pixels are same color (red), so variance should be 0
      expect(result).toBe(0)
    })

    it('returns positive variance for non-uniform edge', () => {
      const img = createTestImageData()
      const result = calculateEdgeVariance(img, 20)
      expect(result).toBeGreaterThan(0)
    })

    it('handles small images', () => {
      const data = new Uint8ClampedArray(2 * 2 * 4)
      data[0] = 255; data[1] = 0; data[2] = 0; data[3] = 255
      data[4] = 0; data[5] = 255; data[6] = 0; data[7] = 255
      data[8] = 0; data[9] = 0; data[10] = 255; data[11] = 255
      data[12] = 255; data[13] = 255; data[14] = 0; data[15] = 255
      const img = new ImageData(data, 2, 2)
      const result = calculateEdgeVariance(img, 4)
      expect(result).toBeGreaterThan(0)
    })
  })

  describe('sampleImagePixels', () => {
    it('returns correct number of samples for gridSize 5', () => {
      const img = createTestImageData()
      const result = sampleImagePixels(img, 5)
      expect(result).toHaveLength(25)
    })

    it('returns correct number of samples for gridSize 3', () => {
      const img = createTestImageData()
      const result = sampleImagePixels(img, 3)
      expect(result).toHaveLength(9)
    })

    it('samples have x and y coordinates within image bounds', () => {
      const img = createTestImageData()
      const result = sampleImagePixels(img, 5)

      for (const sample of result) {
        expect(sample.x).toBeGreaterThanOrEqual(0)
        expect(sample.x).toBeLessThan(img.width)
        expect(sample.y).toBeGreaterThanOrEqual(0)
        expect(sample.y).toBeLessThan(img.height)
      }
    })

    it('samples have r, g, b values in valid range', () => {
      const img = createTestImageData()
      const result = sampleImagePixels(img, 5)

      for (const sample of result) {
        expect(sample.r).toBeGreaterThanOrEqual(0)
        expect(sample.r).toBeLessThanOrEqual(255)
        expect(sample.g).toBeGreaterThanOrEqual(0)
        expect(sample.g).toBeLessThanOrEqual(255)
        expect(sample.b).toBeGreaterThanOrEqual(0)
        expect(sample.b).toBeLessThanOrEqual(255)
      }
    })

    it('returns gridSize * gridSize samples', () => {
      const img = createTestImageData()
      for (let gridSize = 1; gridSize <= 5; gridSize++) {
        const result = sampleImagePixels(img, gridSize)
        expect(result).toHaveLength(gridSize * gridSize)
      }
    })
  })
})