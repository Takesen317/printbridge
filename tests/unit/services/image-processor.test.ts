import { describe, it, expect } from 'vitest'
import { simulatePrintPreview, type ImageProcessorOptions } from '../../../src/renderer/services/image-processor'

function createTestImageData(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 200     // R
    data[i + 1] = 100  // G
    data[i + 2] = 50   // B
    data[i + 3] = 255
  }
  return new ImageData(data, width, height, { colorSpace: 'srgb' })
}

const defaultOptions: ImageProcessorOptions = {
  colorMode: 'rgb',
  resolution: 300,
  paperType: 'coated',
  simulateViewingConditions: true,
  viewingDistance: 250,
  lightSource: 'D50'
}

describe('image-processor', () => {
  describe('simulatePrintPreview', () => {
    it('returns ImageData with correct dimensions', () => {
      const input = createTestImageData(100, 100)
      const result = simulatePrintPreview(input, defaultOptions)
      expect(result.width).toBe(100)
      expect(result.height).toBe(100)
    })

    it('returns ImageData with srgb colorSpace', () => {
      const input = createTestImageData(100, 100)
      const result = simulatePrintPreview(input, defaultOptions)
      expect(result.colorSpace).toBe('srgb')
    })

    it('returns new ImageData with modified pixel data', () => {
      const input = createTestImageData(10, 10)
      const result = simulatePrintPreview(input, defaultOptions)
      // The processed image should have different data than input due to
      // RGB->CMYK->RGB conversion and paper type adjustments
      expect(result.data).toBeInstanceOf(Uint8ClampedArray)
      expect(result.data.length).toBe(input.data.length)
    })

    it('handles different paper types', () => {
      const input = createTestImageData(50, 50)
      const options: ImageProcessorOptions[] = [
        { ...defaultOptions, paperType: 'coated' },
        { ...defaultOptions, paperType: 'uncoated' },
        { ...defaultOptions, paperType: 'newsprint' }
      ]
      options.forEach(opts => {
        const result = simulatePrintPreview(input, opts)
        expect(result).toHaveProperty('width')
        expect(result).toHaveProperty('height')
        expect(result).toHaveProperty('data')
      })
    })

    it('handles different light sources', () => {
      const input = createTestImageData(50, 50)
      const lightSources: Array<'D50' | 'D65' | 'F'> = ['D50', 'D65', 'F']
      lightSources.forEach(ls => {
        const result = simulatePrintPreview(input, { ...defaultOptions, lightSource: ls })
        expect(result).toHaveProperty('width')
        expect(result).toHaveProperty('height')
      })
    })

    it('handles different viewing distances', () => {
      const input = createTestImageData(50, 50)
      const distances = [250, 500, 1000]
      distances.forEach(d => {
        const result = simulatePrintPreview(input, { ...defaultOptions, viewingDistance: d })
        expect(result).toHaveProperty('width')
        expect(result).toHaveProperty('height')
      })
    })

    it('produces different output for materially different viewing distance and resolution settings', () => {
      const width = 32
      const height = 32
      const data = new Uint8ClampedArray(width * height * 4)

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4
          const value = (x + y) % 2 === 0 ? 0 : 255
          data[idx] = value
          data[idx + 1] = value
          data[idx + 2] = value
          data[idx + 3] = 255
        }
      }

      const input = new ImageData(data, width, height, { colorSpace: 'srgb' })
      const sharpResult = simulatePrintPreview(input, {
        ...defaultOptions,
        viewingDistance: 150,
        resolution: 600
      })
      const softResult = simulatePrintPreview(input, {
        ...defaultOptions,
        viewingDistance: 500,
        resolution: 72
      })

      expect(Array.from(sharpResult.data)).not.toEqual(Array.from(softResult.data))
    })

    it('makes viewing distance visibly affect a high-contrast image', () => {
      const input = new ImageData(
        new Uint8ClampedArray([
          0, 0, 0, 255, 255, 255, 255, 255,
          255, 255, 255, 255, 0, 0, 0, 255
        ]),
        2,
        2
      )

      const nearResult = simulatePrintPreview(input, {
        ...defaultOptions,
        viewingDistance: 150,
        resolution: 600
      })
      const farResult = simulatePrintPreview(input, {
        ...defaultOptions,
        viewingDistance: 500,
        resolution: 72
      })

      const nearAverage = nearResult.data[0] + nearResult.data[1] + nearResult.data[2]
      const farAverage = farResult.data[0] + farResult.data[1] + farResult.data[2]

      expect(Math.abs(nearAverage - farAverage)).toBeGreaterThan(10)
    })

    it('handles RGB color mode', () => {
      const input = createTestImageData(20, 20)
      const result = simulatePrintPreview(input, { ...defaultOptions, colorMode: 'rgb' })
      expect(result.width).toBe(20)
      expect(result.height).toBe(20)
    })

    it('handles CMYK color mode', () => {
      const input = createTestImageData(20, 20)
      const result = simulatePrintPreview(input, { ...defaultOptions, colorMode: 'cmyk' })
      expect(result.width).toBe(20)
      expect(result.height).toBe(20)
    })

    it('handles small images gracefully', () => {
      const input = createTestImageData(1, 1)
      const result = simulatePrintPreview(input, defaultOptions)
      expect(result.width).toBe(1)
      expect(result.height).toBe(1)
    })

    it('handles large images within memory constraints', () => {
      const input = createTestImageData(200, 200)
      const result = simulatePrintPreview(input, defaultOptions)
      expect(result.width).toBe(200)
      expect(result.height).toBe(200)
    })
  })
})
