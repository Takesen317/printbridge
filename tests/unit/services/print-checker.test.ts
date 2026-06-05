import { describe, expect, it } from 'vitest'
import { checkPrintReadiness } from '../../../src/renderer/services/print-checker'

const createTestImageData = (width: number, height: number, fillColor?: { r: number; g: number; b: number }): ImageData => {
  const data = new Uint8ClampedArray(width * height * 4)
  const fill = fillColor || { r: 128, g: 128, b: 128 }

  for (let i = 0; i < data.length; i += 4) {
    data[i] = fill.r
    data[i + 1] = fill.g
    data[i + 2] = fill.b
    data[i + 3] = 255
  }

  return new ImageData(data, width, height)
}

const createGradientImageData = (width: number, height: number): ImageData => {
  const data = new Uint8ClampedArray(width * height * 4)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      data[idx] = Math.round((x / width) * 255)
      data[idx + 1] = Math.round((y / height) * 255)
      data[idx + 2] = 128
      data[idx + 3] = 255
    }
  }

  return new ImageData(data, width, height)
}

const createLowResImageData = (): ImageData => createTestImageData(595, 842, { r: 200, g: 200, b: 200 })

describe('print-checker', () => {
  describe('checkPrintReadiness', () => {
    it('frames deterministic findings as confirmed checks', () => {
      const result = checkPrintReadiness(createLowResImageData(), { minResolution: 300 })
      const resolutionProblem = result.problems.find((problem) => problem.type === 'low-resolution')

      expect(resolutionProblem).toBeDefined()
      expect(resolutionProblem?.category).toBe('deterministic')
      expect(resolutionProblem?.confidence).toBe('high')
      expect(resolutionProblem?.description).toContain('Confirmed by deterministic checks.')
      expect(resolutionProblem?.description).not.toContain('confidence is')
    })

    it('frames heuristic findings as sampling-based estimates', () => {
      const result = checkPrintReadiness(createGradientImageData(600, 600), { gamutThreshold: 0.1 })
      const gamutProblem = result.problems.find((problem) => problem.type === 'out-of-gamut')

      expect(gamutProblem).toBeDefined()
      expect(gamutProblem?.category).toBe('heuristic')
      expect(gamutProblem?.description).toContain('Flagged by a heuristic check')
      expect(gamutProblem?.description).toContain('sampled pixels')
    })

    it('frames advisory findings as non-confirming guidance', () => {
      const result = checkPrintReadiness(createGradientImageData(800, 800), { paperSize: 'A4', minResolution: 72 })
      const colorModeProblem = result.problems.find((problem) => problem.type === 'color-mode')

      expect(colorModeProblem).toBeDefined()
      expect(colorModeProblem?.category).toBe('advisory')
      expect(colorModeProblem?.description).toContain('Advisory only; confidence is limited')
    })

    it('returns PrintCheckResult with required fields', () => {
      const result = checkPrintReadiness(createTestImageData(100, 100))

      expect(result).toHaveProperty('problems')
      expect(result).toHaveProperty('canPrint')
      expect(result).toHaveProperty('overallScore')
      expect(Array.isArray(result.problems)).toBe(true)
      expect(typeof result.canPrint).toBe('boolean')
      expect(typeof result.overallScore).toBe('number')
    })

    it('high resolution image passes resolution check', () => {
      const result = checkPrintReadiness(createTestImageData(5000, 5000, { r: 200, g: 200, b: 200 }), {
        paperSize: 'A4',
        minResolution: 72
      })

      expect(result.problems.filter((problem) => problem.type === 'low-resolution')).toHaveLength(0)
    })

    it('low resolution image fails resolution check', () => {
      const result = checkPrintReadiness(createLowResImageData(), { minResolution: 300 })
      const resolutionProblems = result.problems.filter((problem) => problem.type === 'low-resolution')

      expect(resolutionProblems.length).toBeGreaterThan(0)
      expect(resolutionProblems[0].severity).toBe('error')
    })

    it('returns canPrint false when errors exist', () => {
      expect(checkPrintReadiness(createLowResImageData()).canPrint).toBe(false)
    })

    it('overallScore is between 0 and 100', () => {
      const result = checkPrintReadiness(createTestImageData(100, 100))
      expect(result.overallScore).toBeGreaterThanOrEqual(0)
      expect(result.overallScore).toBeLessThanOrEqual(100)
    })

    it('high score when no critical errors', () => {
      const result = checkPrintReadiness(createGradientImageData(5000, 5000), { paperSize: 'A4', minResolution: 72 })
      const errorCount = result.problems.filter((problem) => problem.severity === 'error').length

      expect(errorCount).toBe(0)
      expect(result.overallScore).toBeGreaterThanOrEqual(70)
    })

    it('custom paper size affects resolution check', () => {
      const imageData = createTestImageData(1000, 1000)
      const a4Result = checkPrintReadiness(imageData, { paperSize: 'A4', minResolution: 150 })
      const customResult = checkPrintReadiness(imageData, {
        paperSize: 'custom',
        customWidthMm: 80,
        customHeightMm: 80,
        minResolution: 150
      })

      expect(a4Result.problems.some((problem) => problem.type === 'low-resolution')).toBe(true)
      expect(customResult.problems.some((problem) => problem.type === 'low-resolution')).toBe(false)
    })

    it('handles different paper sizes', () => {
      const imageData = createTestImageData(1000, 1000)

      expect(checkPrintReadiness(imageData, { paperSize: 'A4' }).problems).toBeDefined()
      expect(checkPrintReadiness(imageData, { paperSize: 'A3' }).problems).toBeDefined()
      expect(checkPrintReadiness(imageData, { paperSize: 'A5' }).problems).toBeDefined()
    })

    it('problems have required fields', () => {
      const result = checkPrintReadiness(createLowResImageData())

      for (const problem of result.problems) {
        expect(problem).toHaveProperty('type')
        expect(problem).toHaveProperty('severity')
        expect(problem).toHaveProperty('title')
        expect(problem).toHaveProperty('description')
        expect(problem.severity).toMatch(/^(error|warning|info)$/)
      }
    })

    it('out-of-gamut problems include suggestedFix', () => {
      const result = checkPrintReadiness(createTestImageData(100, 100, { r: 255, g: 0, b: 128 }))
      const gamutProblems = result.problems.filter((problem) => problem.type === 'out-of-gamut')

      for (const problem of gamutProblems) {
        expect(problem.suggestedFix).toBeDefined()
        expect(typeof problem.suggestedFix).toBe('string')
      }
    })

    it('handles very small images', () => {
      const result = checkPrintReadiness(createTestImageData(10, 10))
      expect(Array.isArray(result.problems)).toBe(true)
    })

    it('handles very large images', () => {
      const result = checkPrintReadiness(createTestImageData(5000, 5000))
      expect(result.problems).toBeDefined()
      expect(result.problems.filter((problem) => problem.type === 'low-resolution')).toHaveLength(0)
    })

    it('score decreases with errors', () => {
      const lowResResult = checkPrintReadiness(createLowResImageData(), { minResolution: 300 })
      const highResResult = checkPrintReadiness(createGradientImageData(5000, 5000), { minResolution: 72, paperSize: 'A4' })

      expect(lowResResult.problems.filter((problem) => problem.severity === 'error').length).toBeGreaterThan(0)
      expect(highResResult.problems.filter((problem) => problem.severity === 'error')).toHaveLength(0)
      expect(lowResResult.overallScore).toBeLessThan(highResResult.overallScore)
    })

    it('missing-bleed problem has correct severity', () => {
      const result = checkPrintReadiness(createTestImageData(100, 100, { r: 255, g: 255, b: 255 }))
      const bleedProblems = result.problems.filter((problem) => problem.type === 'missing-bleed')

      if (bleedProblems.length > 0) {
        expect(bleedProblems[0].severity).toBe('warning')
      }
    })

    it('reports gamut ratio based on sampling instead of full image pixels', () => {
      const result = checkPrintReadiness(createGradientImageData(600, 600), { gamutThreshold: 0.1 })
      const gamutProblem = result.problems.find((problem) => problem.type === 'out-of-gamut')

      expect(gamutProblem).toBeDefined()
      expect(gamutProblem?.description).toContain('sampled pixels')
    })
  })
})
