import { describe, expect, it } from 'vitest'
import { formatPreflightDescription } from '../../../src/renderer/services/preflight-messages'

describe('preflight-messages', () => {
  it('formats deterministic descriptions without a confidence input', () => {
    const description = formatPreflightDescription({
      category: 'deterministic',
      detail: 'Estimated output resolution is about 72 DPI.'
    })

    expect(description).toContain('Confirmed by deterministic checks.')
    expect(description).toContain('Estimated output resolution is about 72 DPI.')
  })

  it('formats heuristic descriptions with moderate-confidence framing', () => {
    const description = formatPreflightDescription({
      category: 'heuristic',
      confidence: 'medium',
      detail: '12.4% of sampled pixels appear to exceed the target print gamut.'
    })

    expect(description).toContain('Flagged by a heuristic check')
    expect(description).toContain('confidence is moderate')
    expect(description).toContain('12.4% of sampled pixels appear to exceed the target print gamut.')
  })

  it('formats heuristic descriptions with estimate framing even at high confidence', () => {
    const description = formatPreflightDescription({
      category: 'heuristic',
      confidence: 'high',
      detail: 'Edge analysis suggests likely missing bleed.'
    })

    expect(description).toContain('Flagged by a heuristic check')
    expect(description).toContain('still an estimate')
    expect(description).toContain('Edge analysis suggests likely missing bleed.')
  })

  it('formats advisory descriptions with stronger-but-non-confirming framing at high confidence', () => {
    const description = formatPreflightDescription({
      category: 'advisory',
      confidence: 'high',
      detail: 'Profile metadata suggests an RGB workflow.'
    })

    expect(description).toContain('Advisory only')
    expect(description).toContain('signal is strong')
    expect(description).toContain('Profile metadata suggests an RGB workflow.')
  })

  it('formats advisory descriptions with review framing at medium confidence', () => {
    const description = formatPreflightDescription({
      category: 'advisory',
      confidence: 'medium',
      detail: 'Metadata hints at a non-default rendering intent.'
    })

    expect(description).toContain('Advisory only')
    expect(description).toContain('review is still recommended')
    expect(description).toContain('Metadata hints at a non-default rendering intent.')
  })

  it('formats advisory descriptions with limited-confidence framing', () => {
    const description = formatPreflightDescription({
      category: 'advisory',
      confidence: 'low',
      detail: 'Pixel distribution suggests RGB-like content.'
    })

    expect(description).toContain('Advisory only')
    expect(description).toContain('confidence is limited')
    expect(description).toContain('Pixel distribution suggests RGB-like content.')
  })

  it('does not mention confidence wording for deterministic descriptions', () => {
    const description = formatPreflightDescription({
      category: 'deterministic',
      detail: 'Resolution is below the target output threshold.'
    })

    expect(description).toContain('Confirmed by deterministic checks.')
    expect(description).not.toContain('confidence')
  })
})
