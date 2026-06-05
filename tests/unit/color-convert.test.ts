import { describe, it, expect } from 'vitest'
import { rgbToCmyk, cmykToRgb, rgbToLab, labToRgb, deltaE } from '../../src/renderer/utils/color-convert'

describe('color-convert utilities', () => {
  describe('rgbToCmyk', () => {
    it('converts pure red to CMYK', () => {
      const result = rgbToCmyk({ r: 255, g: 0, b: 0 })
      expect(result.c).toBe(0)
      expect(result.m).toBe(100)
      expect(result.y).toBe(100)
      expect(result.k).toBe(0)
    })

    it('converts pure white to CMYK', () => {
      const result = rgbToCmyk({ r: 255, g: 255, b: 255 })
      expect(result.c).toBe(0)
      expect(result.m).toBe(0)
      expect(result.y).toBe(0)
      expect(result.k).toBe(0)
    })

    it('converts pure black to CMYK', () => {
      const result = rgbToCmyk({ r: 0, g: 0, b: 0 })
      expect(result.c).toBe(0)
      expect(result.m).toBe(0)
      expect(result.y).toBe(0)
      expect(result.k).toBe(100)
    })

    it('converts mid gray correctly', () => {
      const result = rgbToCmyk({ r: 128, g: 128, b: 128 })
      expect(result.k).toBeGreaterThan(0)
    })
  })

  describe('cmykToRgb', () => {
    it('converts pure cyan back to RGB', () => {
      const result = cmykToRgb({ c: 100, m: 0, y: 0, k: 0 })
      expect(result.r).toBe(0)
      expect(result.g).toBe(255)
      expect(result.b).toBe(255)
    })

    it('converts pure magenta back to RGB', () => {
      const result = cmykToRgb({ c: 0, m: 100, y: 0, k: 0 })
      expect(result.r).toBe(255)
      expect(result.g).toBe(0)
      expect(result.b).toBe(255)
    })

    it('round-trips red through CMYK', () => {
      const original = { r: 255, g: 0, b: 0 }
      const cmyk = rgbToCmyk(original)
      const result = cmykToRgb(cmyk)
      expect(result.r).toBeCloseTo(original.r, 0)
      expect(result.g).toBeCloseTo(original.g, 0)
      expect(result.b).toBeCloseTo(original.b, 0)
    })

    it('round-trips white through CMYK', () => {
      const original = { r: 255, g: 255, b: 255 }
      const cmyk = rgbToCmyk(original)
      const result = cmykToRgb(cmyk)
      expect(result.r).toBe(255)
      expect(result.g).toBe(255)
      expect(result.b).toBe(255)
    })
  })

  describe('rgbToLab', () => {
    it('converts pure red to LAB', () => {
      const result = rgbToLab({ r: 255, g: 0, b: 0 })
      expect(result.l).toBeGreaterThan(40)
      expect(result.a).toBeGreaterThan(0)
    })

    it('converts pure white to LAB', () => {
      const result = rgbToLab({ r: 255, g: 255, b: 255 })
      expect(result.l).toBe(100)
    })

    it('converts pure black to LAB', () => {
      const result = rgbToLab({ r: 0, g: 0, b: 0 })
      expect(result.l).toBe(0)
    })
  })

  describe('labToRgb', () => {
    it('converts LAB back to RGB', () => {
      const original = { r: 255, g: 0, b: 0 }
      const lab = rgbToLab(original)
      const result = labToRgb(lab)
      expect(result.r).toBeCloseTo(original.r, 0)
      expect(result.g).toBeCloseTo(original.g, 0)
      expect(result.b).toBeCloseTo(original.b, 0)
    })

    it('round-trips white through LAB', () => {
      const original = { r: 255, g: 255, b: 255 }
      const lab = rgbToLab(original)
      const result = labToRgb(lab)
      expect(result.r).toBe(255)
      expect(result.g).toBe(255)
      expect(result.b).toBe(255)
    })

    it('round-trips neutral gray through LAB', () => {
      const original = { r: 128, g: 128, b: 128 }
      const lab = rgbToLab(original)
      const result = labToRgb(lab)
      expect(result.r).toBeCloseTo(original.r, 0)
      expect(result.g).toBeCloseTo(original.g, 0)
      expect(result.b).toBeCloseTo(original.b, 0)
    })
  })

  describe('deltaE', () => {
    it('returns 0 for identical colors', () => {
      const color = { r: 255, g: 0, b: 0 }
      const result = deltaE(color, color)
      expect(result).toBe(0)
    })

    it('returns positive value for different colors', () => {
      const color1 = { r: 255, g: 0, b: 0 }
      const color2 = { r: 0, g: 255, b: 0 }
      const result = deltaE(color1, color2)
      expect(result).toBeGreaterThan(0)
    })

    it('is symmetric', () => {
      const color1 = { r: 255, g: 0, b: 0 }
      const color2 = { r: 0, g: 255, b: 0 }
      expect(deltaE(color1, color2)).toBeCloseTo(deltaE(color2, color1), 10)
    })

    it('considers similar colors have small deltaE', () => {
      const color1 = { r: 255, g: 0, b: 0 }
      const color2 = { r: 255, g: 10, b: 0 }
      const result = deltaE(color1, color2)
      expect(result).toBeLessThan(10)
    })
  })
})