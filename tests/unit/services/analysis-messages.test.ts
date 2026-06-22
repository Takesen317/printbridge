import { describe, expect, it } from 'vitest'
import { getIccInitializationStatusMessage } from '../../../src/renderer/services/analysis-messages'
import { analyzeImageWithAI, getRuleBasedApproximationNotice } from '../../../src/renderer/services/ai-color-advisor'
import { useLocaleStore } from '../../../src/renderer/store/locale'

describe('analysis-messages', () => {
  it('returns the combined fallback status message surfaced by ICC initialization', () => {
    expect(getIccInitializationStatusMessage('en-US')).toBe(
      'ICC engine unavailable. Using simplified color conversion. The preview is approximate and final print output may differ.'
    )
  })

  it('returns the Chinese fallback status message when locale is Chinese', () => {
    expect(getIccInitializationStatusMessage('zh-CN')).toBe('ICC 引擎不可用，当前使用简化色彩转换。预览结果仅作近似参考，最终印刷输出可能存在差异。')
  })

  it('marks fallback AI advice as rule-based, low-confidence, and approximate', async () => {
    useLocaleStore.setState({ locale: 'en-US' })
    const image = new ImageData(new Uint8ClampedArray(4 * 10 * 10).fill(128), 10, 10)
    const result = await analyzeImageWithAI(image, 'general')

    expect(result.source).toBe('rule-based')
    expect(result.confidence).toBe('low')
    expect(result.approximationNotice).toBe(getRuleBasedApproximationNotice())
  })

  it('returns Chinese AI fallback messaging when locale is Chinese', async () => {
    useLocaleStore.setState({ locale: 'zh-CN' })
    const image = new ImageData(new Uint8ClampedArray(4 * 10 * 10).fill(128), 10, 10)
    const result = await analyzeImageWithAI(image, 'general')

    expect(result.approximationNotice).toBe('当前建议来自内置规则模型，而不是实时大模型响应。')
    expect(result.reasoning).toContain('基于规则的分析建议')
  })
})
