import { translate } from '../constants/i18n'
import { useLocaleStore } from '../store/locale'

export interface ImageColorData {
  dominantColors: string[]
  brightness: number
  contrast: 'low' | 'medium' | 'high'
  saturation: 'low' | 'medium' | 'high'
  colorTemperature: 'warm' | 'neutral' | 'cool'
  hasSkinTones: boolean
  sceneType: 'photo' | 'graphic' | 'mixed' | 'unknown'
}

export type AIAdviceSource = 'deepseek' | 'rule-based'
export type AIAdviceConfidence = 'high' | 'medium' | 'low'

export interface AIColorAdvice {
  recommendedProfile: string
  profileType: 'rgb' | 'cmyk'
  colorTemperature: 'warm' | 'neutral' | 'cool'
  saturation: 'low' | 'medium' | 'high'
  contrast: 'soft' | 'normal' | 'strong'
  reasoning: string
  printingTips: string[]
  source: AIAdviceSource
  confidence: AIAdviceConfidence
  approximationNotice?: string
}

export interface AIColorAnalysisRequest {
  imageData: ImageData
  targetUse: 'magazine' | 'brochure' | 'photo_print' | 'packaging' | 'general'
}

const ICC_PROFILES = {
  sRGB: { type: 'rgb', description: 'Standard RGB - universal for screen and web' },
  AdobeRGB: { type: 'rgb', description: 'Adobe RGB - wider gamut for photography' },
  CoatedFOGRA39: { type: 'cmyk', description: 'European coated paper - premium magazines' },
  UncoatedFOGRA29: { type: 'cmyk', description: 'European uncoated paper - office prints' },
  JapanColor2001: { type: 'cmyk', description: 'Japan Color standard - Asian printing' },
  GRACoL2006: { type: 'cmyk', description: 'US uncoated paper - general commercial' }
}

export function extractColorData(imageData: ImageData): ImageColorData {
  const data = imageData.data
  const pixelCount = data.length / 4

  let totalR = 0
  let totalG = 0
  let totalB = 0
  let minR = 255
  let maxR = 0
  let minG = 255
  let maxG = 0
  let minB = 255
  let maxB = 0
  let saturatedPixels = 0
  let skinTonePixels = 0
  let warmPixels = 0
  let coolPixels = 0

  const sampleStep = 10
  for (let i = 0; i < data.length; i += 4 * sampleStep) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    totalR += r
    totalG += g
    totalB += b

    minR = Math.min(minR, r)
    maxR = Math.max(maxR, r)
    minG = Math.min(minG, g)
    maxG = Math.max(maxG, g)
    minB = Math.min(minB, b)
    maxB = Math.max(maxB, b)

    const maxC = Math.max(r, g, b)
    const minC = Math.min(r, g, b)
    if (maxC - minC > 100) saturatedPixels++

    if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) < 35) {
      skinTonePixels++
    }

    if (r > b + 20) warmPixels++
    if (b > r + 20) coolPixels++
  }

  const avgR = totalR / pixelCount
  const avgG = totalG / pixelCount
  const avgB = totalB / pixelCount
  const brightness = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB
  const contrastValue = Math.max(maxR - minR, maxG - minG, maxB - minB)
  const colorfulness = saturatedPixels / (pixelCount / sampleStep)

  const dominantColors = [
    `#${Math.round(avgR).toString(16).padStart(2, '0')}${Math.round(avgG).toString(16).padStart(2, '0')}${Math.round(avgB).toString(16).padStart(2, '0')}`
  ]

  return {
    dominantColors,
    brightness: Math.round(brightness),
    contrast: contrastValue > 150 ? 'high' : contrastValue > 80 ? 'medium' : 'low',
    saturation: colorfulness > 0.35 ? 'high' : colorfulness > 0.15 ? 'medium' : 'low',
    colorTemperature: warmPixels > coolPixels * 1.5 ? 'warm' : coolPixels > warmPixels * 1.5 ? 'cool' : 'neutral',
    hasSkinTones: skinTonePixels > 30,
    sceneType: colorfulness > 0.4 ? 'graphic' : colorfulness > 0.15 ? 'mixed' : skinTonePixels > 50 ? 'photo' : 'unknown'
  }
}

function buildAnalysisPrompt(colorData: ImageColorData, targetUse: string): string {
  return `You are a professional color management consultant for print production.

Analyze this image's color characteristics and recommend the best ICC profile for ${targetUse} printing.

Image Color Analysis:
- Dominant color: ${colorData.dominantColors[0]}
- Brightness: ${colorData.brightness}/255
- Contrast: ${colorData.contrast}
- Saturation: ${colorData.saturation}
- Color temperature: ${colorData.colorTemperature}
- Has skin tones: ${colorData.hasSkinTones ? 'Yes' : 'No'}
- Scene type: ${colorData.sceneType}

Available ICC Profiles:
- sRGB (RGB)
- Adobe RGB (RGB)
- Coated FOGRA39 (CMYK)
- Uncoated FOGRA29 (CMYK)
- Japan Color 2001 Coated (CMYK)
- GRACoL2006 (CMYK)

Respond in JSON with:
{
  "recommendedProfile": "Profile Name",
  "profileType": "rgb" or "cmyk",
  "colorTemperature": "warm" or "neutral" or "cool",
  "saturation": "low" or "medium" or "high",
  "contrast": "soft" or "normal" or "strong",
  "reasoning": "why this profile is recommended",
  "printingTips": ["tip1", "tip2", "tip3"]
}`
}

function simulateAIAnalysis(colorData: ImageColorData, targetUse: string): AIColorAdvice {
  const locale = useLocaleStore.getState().locale
  let recommendedProfile = 'sRGB'
  let profileType: 'rgb' | 'cmyk' = 'rgb'

  if (targetUse === 'magazine' || targetUse === 'brochure') {
    if (colorData.saturation === 'high' && colorData.sceneType === 'graphic') {
      recommendedProfile = 'Coated FOGRA39'
      profileType = 'cmyk'
    } else if (colorData.hasSkinTones) {
      recommendedProfile = 'Adobe RGB'
    } else {
      recommendedProfile = 'Coated FOGRA39'
      profileType = 'cmyk'
    }
  } else if (targetUse === 'photo_print') {
    recommendedProfile = colorData.hasSkinTones ? 'Adobe RGB' : 'sRGB'
  } else if (targetUse === 'packaging') {
    recommendedProfile = 'Japan Color 2001 Coated'
    profileType = 'cmyk'
  } else {
    recommendedProfile = colorData.sceneType === 'photo' ? 'Adobe RGB' : 'sRGB'
  }

  const printingTips: string[] = []
  if (colorData.hasSkinTones) printingTips.push(translate(locale, 'ai.tip.skinTones'))
  if (colorData.contrast === 'high') printingTips.push(translate(locale, 'ai.tip.highContrast'))
  if (colorData.saturation === 'high') printingTips.push(translate(locale, 'ai.tip.highSaturation'))
  if (colorData.colorTemperature === 'warm') printingTips.push(translate(locale, 'ai.tip.warmTones'))

  return {
    recommendedProfile,
    profileType,
    colorTemperature: colorData.colorTemperature,
    saturation: colorData.saturation,
    contrast: colorData.contrast === 'high' ? 'strong' : colorData.contrast === 'medium' ? 'normal' : 'soft',
    reasoning: translate(locale, 'ai.reasoning', {
      profile: recommendedProfile,
      targetUse,
      sceneType: colorData.sceneType,
      saturation: colorData.saturation,
      contrast: colorData.contrast
    }),
    printingTips: printingTips.length > 0 ? printingTips : [translate(locale, 'ai.tip.softProof')],
    source: 'rule-based',
    confidence: 'low',
    approximationNotice: translate(locale, 'ai.ruleBasedNotice')
  }
}

export async function analyzeImageWithAI(
  imageData: ImageData,
  targetUse: AIColorAnalysisRequest['targetUse'] = 'general'
): Promise<AIColorAdvice> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY
  const colorData = extractColorData(imageData)

  const targetUseLabels = {
    magazine: 'magazine/high-quality print',
    brochure: 'brochure/marketing material',
    photo_print: 'photo reproduction',
    packaging: 'product packaging',
    general: 'general purpose printing'
  }

  if (apiKey) {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a professional color management consultant. Always respond in valid JSON format.'
            },
            {
              role: 'user',
              content: buildAnalysisPrompt(colorData, targetUseLabels[targetUse])
            }
          ],
          temperature: 0.3
        })
      })

      if (response.ok) {
        const data = await response.json()
        const content = data.choices?.[0]?.message?.content
        if (content) {
          const advice = JSON.parse(content.replace(/```json\n?/g, '').replace(/```\n?/g, ''))
          return {
            recommendedProfile: advice.recommendedProfile,
            profileType: advice.profileType,
            colorTemperature: advice.colorTemperature,
            saturation: advice.saturation,
            contrast: advice.contrast,
            reasoning: advice.reasoning,
            printingTips: advice.printingTips,
            source: 'deepseek',
            confidence: 'medium',
            approximationNotice: undefined
          }
        }
      }
    } catch (error) {
      console.warn('DeepSeek API call failed, falling back to rule-based advice:', error)
    }
  }

  return simulateAIAnalysis(colorData, targetUse)
}

export function getAvailableProfilesForAI(): typeof ICC_PROFILES {
  return ICC_PROFILES
}

export function getRuleBasedApproximationNotice(): string {
  return translate(useLocaleStore.getState().locale, 'ai.ruleBasedNotice')
}
