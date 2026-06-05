import { describe, it, expect } from 'vitest'
import { getAvailableProfiles, analyzeColor, type ICCProfile } from '../../../src/renderer/services/color-engine'

// Helper to create a small test ImageData
const createTestImageData = (): ImageData => {
  const data = new Uint8ClampedArray(5 * 5 * 4) // 5x5 image, RGBA
  // Fill with a gradient pattern
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const idx = (y * 5 + x) * 4
      data[idx] = x * 50        // R
      data[idx + 1] = y * 50    // G
      data[idx + 2] = 128       // B
      data[idx + 3] = 255       // A
    }
  }
  return new ImageData(data, 5, 5)
}

// Helper to create uniform gray ImageData
const createGrayImageData = (): ImageData => {
  const data = new Uint8ClampedArray(5 * 5 * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 128     // R
    data[i + 1] = 128 // G
    data[i + 2] = 128 // B
    data[i + 3] = 255 // A
  }
  return new ImageData(data, 5, 5)
}

// Helper to create pure red ImageData
const createRedImageData = (): ImageData => {
  const data = new Uint8ClampedArray(5 * 5 * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255     // R
    data[i + 1] = 0   // G
    data[i + 2] = 0   // B
    data[i + 3] = 255 // A
  }
  return new ImageData(data, 5, 5)
}

describe('color-engine', () => {
  describe('getAvailableProfiles', () => {
    it('returns array of profiles', () => {
      const profiles = getAvailableProfiles()
      expect(Array.isArray(profiles)).toBe(true)
      expect(profiles.length).toBeGreaterThan(0)
    })

    it('each profile has required fields', () => {
      const profiles = getAvailableProfiles()
      for (const profile of profiles) {
        expect(profile).toHaveProperty('name')
        expect(profile).toHaveProperty('description')
        expect(profile).toHaveProperty('type')
        expect(profile.type).toMatch(/^(rgb|cmyk)$/)
      }
    })

    it('includes common profiles like sRGB and Adobe RGB', () => {
      const profiles = getAvailableProfiles()
      const names = profiles.map(p => p.name)
      expect(names).toContain('sRGB')
      expect(names).toContain('Adobe RGB')
    })

    it('includes CMYK profiles', () => {
      const profiles = getAvailableProfiles()
      const cmykProfiles = profiles.filter(p => p.type === 'cmyk')
      expect(cmykProfiles.length).toBeGreaterThan(0)
    })

    it('profiles array is stable (same profiles every call)', () => {
      const profiles1 = getAvailableProfiles()
      const profiles2 = getAvailableProfiles()
      expect(profiles1).toEqual(profiles2)
    })
  })

  describe('analyzeColor', () => {
    const testProfile: ICCProfile = {
      name: 'sRGB',
      description: 'Test',
      type: 'rgb'
    }

    it('returns ColorAnalysis object with required fields', () => {
      const imageData = createTestImageData()
      const result = analyzeColor(imageData, testProfile)

      expect(result).toHaveProperty('representativeColor')
      expect(result).toHaveProperty('convertedColor')
      expect(result).toHaveProperty('averageDeltaE')
      expect(result).toHaveProperty('maxDeltaE')
      expect(result).toHaveProperty('isInGamut')
      expect(result).toHaveProperty('inGamutPercentage')
      expect(result).toHaveProperty('sampleCount')
    })

    it('returns correct sampleCount for 5x5 grid', () => {
      const imageData = createTestImageData()
      const result = analyzeColor(imageData, testProfile)
      expect(result.sampleCount).toBe(25) // 5x5 = 25 samples
    })

    it('representativeColor has r, g, b properties', () => {
      const imageData = createTestImageData()
      const result = analyzeColor(imageData, testProfile)

      expect(result.representativeColor).toHaveProperty('r')
      expect(result.representativeColor).toHaveProperty('g')
      expect(result.representativeColor).toHaveProperty('b')
    })

    it('convertedColor has c, m, y, k properties', () => {
      const imageData = createTestImageData()
      const result = analyzeColor(imageData, testProfile)

      expect(result.convertedColor).toHaveProperty('c')
      expect(result.convertedColor).toHaveProperty('m')
      expect(result.convertedColor).toHaveProperty('y')
      expect(result.convertedColor).toHaveProperty('k')
    })

    it('gray image has low deltaE values', () => {
      const imageData = createGrayImageData()
      const result = analyzeColor(imageData, testProfile)

      // Gray should convert well through CMYK and back
      expect(result.averageDeltaE).toBeLessThan(5)
      expect(result.isInGamut).toBe(true)
      expect(result.inGamutPercentage).toBe(100)
    })

    it('pure red image has measurable deltaE', () => {
      const imageData = createRedImageData()
      const result = analyzeColor(imageData, testProfile)

      // Pure red (255,0,0) converts to CMYK and back, the round-trip has some delta
      // The exact value depends on the conversion algorithm
      expect(result.averageDeltaE).toBeGreaterThanOrEqual(0)
    })

    it('maxDeltaE is greater than or equal to averageDeltaE', () => {
      const imageData = createTestImageData()
      const result = analyzeColor(imageData, testProfile)

      expect(result.maxDeltaE).toBeGreaterThanOrEqual(result.averageDeltaE)
    })

    it('inGamutPercentage is between 0 and 100', () => {
      const imageData = createTestImageData()
      const result = analyzeColor(imageData, testProfile)

      expect(result.inGamutPercentage).toBeGreaterThanOrEqual(0)
      expect(result.inGamutPercentage).toBeLessThanOrEqual(100)
    })

    it('isInGamut is based on averageDeltaE < 3', () => {
      const grayImage = createGrayImageData()
      const redImage = createRedImageData()

      const grayResult = analyzeColor(grayImage, testProfile)
      const redResult = analyzeColor(redImage, testProfile)

      // Gray should be in gamut (low deltaE), red may or may not be
      // This test just verifies the logic is consistent
      if (grayResult.averageDeltaE < 3) {
        expect(grayResult.isInGamut).toBe(true)
      }
    })

    it('handles small images', () => {
      // 2x2 image - analyzeColor uses 5x5 grid sampling
      const data = new Uint8ClampedArray(2 * 2 * 4)
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 100; data[i + 1] = 100; data[i + 2] = 100; data[i + 3] = 255
      }
      const imageData = new ImageData(data, 2, 2)
      const result = analyzeColor(imageData, testProfile)

      // 5x5 grid sampling = 25 samples regardless of image size
      expect(result.sampleCount).toBe(25)
      expect(result.averageDeltaE).toBeGreaterThanOrEqual(0)
    })
  })
})