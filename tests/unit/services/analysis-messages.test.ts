import { describe, expect, it } from 'vitest'
import { getIccInitializationStatusMessage } from '../../../src/renderer/services/analysis-messages'
import {
  analyzeImageWithAI,
  getRuleBasedApproximationNotice
} from '../../../src/renderer/services/ai-color-advisor'

describe('analysis-messages', () => {
  it('returns the combined fallback status message surfaced by ICC initialization', () => {
    expect(getIccInitializationStatusMessage()).toBe(
      'ICC engine unavailable. Using simplified color conversion. Fallback preview is approximate and final print output may differ.'
    )
  })

  it('marks fallback AI advice as rule-based, low-confidence, and approximate', async () => {
    const image = new ImageData(new Uint8ClampedArray(4 * 10 * 10).fill(128), 10, 10)
    const result = await analyzeImageWithAI(image, 'general')

    expect(result.source).toBe('rule-based')
    expect(result.confidence).toBe('low')
    expect(result.approximationNotice).toBe(getRuleBasedApproximationNotice())
  })
})
