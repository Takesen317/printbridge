/**
 * AI Color Advisor Service
 *
 * Uses DeepSeek LLM to analyze images and recommend ICC profiles
 * for print production. This integrates AI into the color management workflow.
 */

// Types for AI analysis
export interface ImageColorData {
  dominantColors: string[]      // Hex colors
  brightness: number            // 0-255
  contrast: 'low' | 'medium' | 'high'
  saturation: 'low' | 'medium' | 'high'
  colorTemperature: 'warm' | 'neutral' | 'cool'
  hasSkinTones: boolean
  sceneType: 'photo' | 'graphic' | 'mixed' | 'unknown'
}

export interface AIColorAdvice {
  recommendedProfile: string    // ICC profile name
  profileType: 'rgb' | 'cmyk'
  colorTemperature: 'warm' | 'neutral' | 'cool'
  saturation: 'low' | 'medium' | 'high'
  contrast: 'soft' | 'normal' | 'strong'
  reasoning: string
  printingTips: string[]
}

export interface AIColorAnalysisRequest {
  imageData: ImageData
  targetUse: 'magazine' | 'brochure' | 'photo_print' | 'packaging' | 'general'
}

// Available ICC profiles for recommendation
const ICC_PROFILES = {
  sRGB: { type: 'rgb', description: 'Standard RGB - universal for screen and web' },
  AdobeRGB: { type: 'rgb', description: 'Adobe RGB - wider gamut for photography' },
  CoatedFOGRA39: { type: 'cmyk', description: 'European coated paper - premium magazines' },
  UncoatedFOGRA29: { type: 'cmyk', description: 'European uncoated paper - office prints' },
  JapanColor2001: { type: 'cmyk', description: 'Japan Color standard - Asian printing' },
  GRACoL2006: { type: 'cmyk', description: 'US uncoated paper - general commercial' }
}

/**
 * Extract color characteristics from image data
 */
export function extractColorData(imageData: ImageData): ImageColorData {
  const data = imageData.data
  const pixelCount = data.length / 4

  let totalR = 0, totalG = 0, totalB = 0
  let minR = 255, maxR = 0
  let minG = 255, maxG = 0
  let minB = 255, maxB = 0
  let saturatedPixels = 0
  let skinTonePixels = 0
  let warmPixels = 0, coolPixels = 0

  // Sample pixels (every 10th pixel for performance)
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

    // Check saturation (colorfulness)
    const maxC = Math.max(r, g, b)
    const minC = Math.min(r, g, b)
    if (maxC - minC > 100) saturatedPixels++

    // Check skin tones (approximate)
    if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) < 35) {
      skinTonePixels++
    }

    // Check color temperature
    if (r > b + 20) warmPixels++
    if (b > r + 20) coolPixels++
  }

  const avgR = totalR / pixelCount
  const avgG = totalG / pixelCount
  const avgB = totalB / pixelCount

  // Calculate brightness
  const brightness = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB)

  // Calculate contrast (max difference in通道)
  const contrastValue = Math.max(maxR - minR, maxG - minG, maxB - minB)

  // Determine scene type based on color distribution
  const colorfulness = saturatedPixels / (pixelCount / sampleStep)
  const sceneType: ImageColorData['sceneType'] =
    colorfulness > 0.4 ? 'graphic' :
    colorfulness > 0.15 ? 'mixed' :
    skinTonePixels > 50 ? 'photo' : 'unknown'

  // Dominant colors (simple k-means would be better but this is simplified)
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
    sceneType
  }
}

/**
 * Build prompt for DeepSeek API
 */
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
- sRGB (RGB) - Standard for web/screen
- Adobe RGB (RGB) - Wider gamut for photography
- Coated FOGRA39 (CMYK) - European coated paper, premium magazines
- Uncoated FOGRA29 (CMYK) - European uncoated paper
- Japan Color 2001 Coated (CMYK) - Japanese standard
- GRACoL2006 (CMYK) - US uncoated paper

Based on the image characteristics and printing use case, provide:
1. Recommended ICC profile (from the list above)
2. Profile type (rgb or cmyk)
3. Color temperature adjustment if needed
4. Saturation adjustment if needed
5. Contrast adjustment if needed
6. Brief reasoning for the recommendation
7. 2-3 practical printing tips

Respond in JSON format:
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

/**
 * Simulated AI analysis (for demo without API key)
 * In production, this would call the actual DeepSeek API
 */
function simulateAIAnalysis(colorData: ImageColorData, targetUse: string): AIColorAdvice {
  // Smart rule-based recommendation for demo
  let recommendedProfile = 'sRGB'
  let profileType: 'rgb' | 'cmyk' = 'rgb'

  if (targetUse === 'magazine' || targetUse === 'brochure') {
    if (colorData.saturation === 'high' && colorData.sceneType === 'graphic') {
      recommendedProfile = 'Coated FOGRA39'
      profileType = 'cmyk'
    } else if (colorData.hasSkinTones) {
      recommendedProfile = 'Adobe RGB'  // Better skin tone reproduction
      profileType = 'rgb'
    } else {
      recommendedProfile = 'Coated FOGRA39'
      profileType = 'cmyk'
    }
  } else if (targetUse === 'photo_print') {
    if (colorData.hasSkinTones) {
      recommendedProfile = 'Adobe RGB'
    } else {
      recommendedProfile = 'sRGB'
    }
  } else if (targetUse === 'packaging') {
    recommendedProfile = 'Japan Color 2001 Coated'
    profileType = 'cmyk'
  } else {
    recommendedProfile = colorData.sceneType === 'photo' ? 'Adobe RGB' : 'sRGB'
  }

  const printingTips: string[] = []
  if (colorData.hasSkinTones) {
    printingTips.push('Pay attention to skin tone reproduction - consider a proof before full print')
  }
  if (colorData.contrast === 'high') {
    printingTips.push('High contrast image may lose detail in shadows - use soft proofing')
  }
  if (colorData.saturation === 'high') {
    printingTips.push('Saturated colors may appear less vibrant in CMYK - check gamut warning')
  }
  if (colorData.colorTemperature === 'warm') {
    printingTips.push('Warm tones print well on coated paper - consider FOGRA39')
  }

  return {
    recommendedProfile,
    profileType,
    colorTemperature: colorData.colorTemperature,
    saturation: colorData.saturation,
    contrast: colorData.contrast === 'high' ? 'strong' : colorData.contrast === 'medium' ? 'normal' : 'soft',
    reasoning: `Based on ${colorData.sceneType} content with ${colorData.saturation} saturation and ${colorData.contrast} contrast, ${recommendedProfile} provides the best color management for ${targetUse} printing.`,
    printingTips: printingTips.length > 0 ? printingTips : ['Use soft proofing to preview colors before printing']
  }
}

/**
 * Analyze image and get AI color advice
 *
 * Note: This implementation uses simulated AI for demonstration.
 * To use real DeepSeek AI, set VITE_DEEPSEEK_API_KEY in environment
 * and the function will call the actual API.
 */
export async function analyzeImageWithAI(
  imageData: ImageData,
  targetUse: AIColorAnalysisRequest['targetUse'] = 'general'
): Promise<AIColorAdvice> {
  // Check for API key
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY

  // Extract color data from image
  const colorData = extractColorData(imageData)

  const targetUseLabels = {
    magazine: 'magazine/high-quality print',
    brochure: 'brochure/marketing material',
    photo_print: 'photo reproduction',
    packaging: 'product packaging',
    general: 'general purpose printing'
  }

  // If API key exists, use real DeepSeek API
  if (apiKey) {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
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
          // Parse JSON response
          const advice = JSON.parse(content.replace(/```json\n?/g, '').replace(/```\n?/g, ''))
          return {
            recommendedProfile: advice.recommendedProfile,
            profileType: advice.profileType,
            colorTemperature: advice.colorTemperature,
            saturation: advice.saturation,
            contrast: advice.contrast,
            reasoning: advice.reasoning,
            printingTips: advice.printingTips
          }
        }
      }
    } catch (error) {
      console.warn('DeepSeek API call failed, using simulation:', error)
    }
  }

  // Fallback to simulation
  console.info('Using simulated AI analysis. Set VITE_DEEPSEEK_API_KEY for real AI analysis.')
  return simulateAIAnalysis(colorData, targetUse)
}

/**
 * Get all available ICC profiles
 */
export function getAvailableProfilesForAI(): typeof ICC_PROFILES {
  return ICC_PROFILES
}
