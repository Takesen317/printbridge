import { rgbToCmyk, cmykToRgb, deltaE, RGB, CMYK } from '../utils/color-convert'
import { sampleImagePixels } from '../utils/image-utils'
import { initLcms, isLcmsReady, getLoadedProfile, getSrgbProfile, getLcms, createTransform, deleteTransform } from './icc-handler'
import { getIccInitializationStatusMessage } from './analysis-messages'
import { useColorStore } from '../store/color'

/**
 * Initialize the ICC color management engine
 * Call this during app startup to prepare lcms-wasm
 * Sets iccEngineStatus in the color store to notify UI of initialization result
 */
export async function initializeColorEngine(): Promise<{ success: boolean; message?: string }> {
  // Set status to initializing
  useColorStore.getState().setIccEngineStatus('initializing')

  if (isLcmsReady()) {
    useColorStore.getState().setIccEngineStatus('ready')
    return { success: true }
  }

  try {
    await initLcms()
    useColorStore.getState().setIccEngineStatus('ready')
    return { success: true }
  } catch (err) {
    console.warn('ICC engine initialization failed, using simplified color conversion:', err)
    useColorStore.getState().setIccEngineStatus('degraded')
    return {
      success: false,
      message: getIccInitializationStatusMessage()
    }
  }
}

/**
 * Check if ICC engine is ready for real ICC-based color conversion
 */
export function isIccEngineReady(): boolean {
  return isLcmsReady()
}

export interface ICCProfile {
  name: string
  description: string
  type: 'rgb' | 'cmyk'
  isCustom?: boolean
}

export interface ColorAnalysis {
  // Representative average color from the sampled image data.
  representativeColor: RGB
  // CMYK color after conversion from the representative color.
  convertedColor: CMYK
  // Average color difference across sampled pixels.
  averageDeltaE: number
  // Maximum color difference across sampled pixels.
  maxDeltaE: number
  // Whether the sampled result stays within the target gamut.
  isInGamut: boolean
  // Percentage of sampled pixels that remain in gamut.
  inGamutPercentage: number
  // Number of pixels sampled during analysis.
  sampleCount: number
}

const DEFAULT_PROFILES: ICCProfile[] = [
  { name: 'sRGB', description: 'Standard RGB color space', type: 'rgb' },
  { name: 'Adobe RGB', description: 'Adobe RGB color space', type: 'rgb' },
  { name: 'Coated FOGRA39', description: 'European coated printing standard', type: 'cmyk' },
  { name: 'Uncoated FOGRA29', description: 'European uncoated printing standard', type: 'cmyk' },
  { name: 'Japan Color 2001 Coated', description: 'Japan printing standard for coated stock', type: 'cmyk' }
]

/**
 * Analyze color characteristics of an image using grid sampling
 * Uses 5x5 grid sampling to get representative color analysis
 *
 * Note: When a custom ICC profile is loaded and the ICC engine is ready,
 * this function can use real ICC-based color conversion for more accurate results.
 * Currently falls back to simplified LAB-based conversion when ICC is unavailable.
 *
 * @param imageData - Image to analyze
 * @param targetProfile - ICC profile to use for color conversion (when ICC engine ready)
 */
export function analyzeColor(imageData: ImageData, targetProfile: ICCProfile): ColorAnalysis {
  // Use a 5x5 grid to sample representative pixels from the image.
  const samples = sampleImagePixels(imageData, 5)

  let totalR = 0, totalG = 0, totalB = 0
  let totalDeltaE = 0
  let maxDeltaE = 0
  let inGamutCount = 0

  let transformHandle: number | null = null
  let useIccConversion = false

  // Check if we can use real ICC-based conversion
  if (isLcmsReady() && targetProfile.type === 'cmyk') {
    // Get the sRGB source profile
    const srgbProfile = getSrgbProfile()
    // Get the target CMYK profile from cache
    const cmykProfile = getLoadedProfile(targetProfile.name) ||
                        (targetProfile.isCustom ? null : getLoadedProfile(targetProfile.name))

    if (srgbProfile && cmykProfile) {
      // Create sRGB -> CMYK transform for ICC-based conversion
      transformHandle = createTransform(srgbProfile, cmykProfile, 0) // INTENT_PERCEPTUAL = 0
      if (transformHandle) {
        useIccConversion = true
      }
    }
  }

  for (const sample of samples) {
    const originalColor: RGB = { r: sample.r, g: sample.g, b: sample.b }
    totalR += sample.r
    totalG += sample.g
    totalB += sample.b

    let convertedColor: CMYK

    if (useIccConversion && transformHandle) {
      // Use ICC-based conversion via lcms-wasm
      const lcms = getLcms()
      if (lcms) {
        // Input RGB as [R, G, B] - lcms expects RGB without alpha for pixel transforms
        const input = new Uint8Array([originalColor.r, originalColor.g, originalColor.b])
        const output = new Uint8Array(4)
        lcms.cmsDoTransform(transformHandle, input, output, 1)
        convertedColor = { c: output[0], m: output[1], y: output[2], k: output[3] }
      } else {
        convertedColor = rgbToCmyk(originalColor)
      }
    } else {
      // Fallback to simplified LAB-based conversion
      convertedColor = rgbToCmyk(originalColor)
    }

    // Convert back to RGB for deltaE calculation
    const backToRgb = cmykToRgb(convertedColor)
    const dE = deltaE(originalColor, backToRgb)

    totalDeltaE += dE
    if (dE > maxDeltaE) maxDeltaE = dE

    // DeltaE below 3 is commonly treated as visually in gamut.
    if (dE < 3) inGamutCount++
  }

  // Clean up ICC transform
  if (transformHandle) {
    deleteTransform(transformHandle)
  }

  const sampleCount = samples.length
  const averageDeltaE = totalDeltaE / sampleCount
  const inGamutPercentage = (inGamutCount / sampleCount) * 100

  // Use the average sampled RGB value as the representative color.
  const representativeColor: RGB = {
    r: Math.round(totalR / sampleCount),
    g: Math.round(totalG / sampleCount),
    b: Math.round(totalB / sampleCount)
  }

  const convertedColor = rgbToCmyk(representativeColor)

  // Treat the image as in gamut when the average DeltaE stays below 3.
  const isInGamut = averageDeltaE < 3

  return {
    representativeColor,
    convertedColor,
    averageDeltaE: Math.round(averageDeltaE * 100) / 100,
    maxDeltaE: Math.round(maxDeltaE * 100) / 100,
    isInGamut,
    inGamutPercentage: Math.round(inGamutPercentage * 10) / 10,
    sampleCount
  }
}

/**
 * @deprecated This function is kept for backwards compatibility.
 * Use analyzeColor instead.
 */
export function analyzeColorWithIcc(imageData: ImageData, targetProfile: ICCProfile): ColorAnalysis {
  return analyzeColor(imageData, targetProfile)
}

export function getAvailableProfiles(): ICCProfile[] {
  return DEFAULT_PROFILES
}
