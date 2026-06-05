/**
 * ICC Profile Handler
 *
 * Provides ICC-based color conversion using lcms-wasm (LittleCMS WebAssembly).
 * This enables professional-grade color management with real ICC profiles.
 *
 * Note: This is Phase 1 of ICC support - basic profile loading and transform creation.
 * Real ICC profiles (.icc files) need to be loaded by the user or bundled with the app.
 */

// @ts-expect-error - lcms-wasm doesn't provide TypeScript declarations
import { instantiate } from 'lcms-wasm'

// Types for lcms-wasm (inline since no type declarations exist)
type ProfileHandle = number
type TransformHandle = number
type ColorSpaceType = number

interface LcmsWasm {
  cmsOpenProfileFromMem(buffer: Uint8Array, size: number): ProfileHandle | null
  cmsCloseProfile(profile: ProfileHandle): number
  cmsGetProfileInfoASCII(profile: ProfileHandle, info: number, language: string, country: string): string
  cmsGetColorSpaceASCII(profile: ProfileHandle): string
  cmsGetDeviceClassASCII(profile: ProfileHandle): string
  cmsCreateTransform(
    sourceProfile: ProfileHandle,
    sourceEncoding: ColorSpaceType,
    destProfile: ProfileHandle,
    destEncoding: ColorSpaceType,
    intent: number
  ): TransformHandle | null
  cmsDeleteTransform(transform: TransformHandle): void
  cmsDoTransform(transform: TransformHandle, input: Uint8Array, output: Uint8Array, size: number): void
  cmsCreate_sRGBProfile(): ProfileHandle
  cmsSigXYZData: ColorSpaceType
  cmsSigLabData: ColorSpaceType
  cmsSigRgbData: ColorSpaceType
  cmsSigCmykData: ColorSpaceType
  cmsSigGrayData: ColorSpaceType
  cmsSigYCbCrData: ColorSpaceType
  cmsInfoDescription: number
  cmsInfoManufacturer: number
  cmsInfoModel: number
  cmsInfoCopyright: number
  INTENT_PERCEPTUAL: number
  INTENT_RELATIVE_COLORIMETRIC: number
  INTENT_SATURATION: number
  INTENT_ABSOLUTE_COLORIMETRIC: number
}

// Color space signatures
const CMS_SIG_RGB = 0x52474220  // 'RGB '
const CMS_SIG_CMYK = 0x434D594B  // 'CMYK'
const CMS_SIG_XYZ = 0x58595A20  // 'XYZ '
const CMS_SIG_LAB = 0x4C616220  // 'Lab'

// Rendering intents
export const INTENT_PERCEPTUAL = 0
export const INTENT_RELATIVE_COLORIMETRIC = 1

export type RenderingIntent = 0 | 1

export interface LoadedProfile {
  name: string
  handle: ProfileHandle
  colorSpace: 'RGB' | 'CMYK' | 'XYZ' | 'Lab'
  type: 'rgb' | 'cmyk'
}

// Singleton instance of lcms WASM
let lcmsInstance: LcmsWasm | null = null
let initPromise: Promise<LcmsWasm> | null = null

// Cache for loaded ICC profiles (keyed by profile name)
const loadedProfilesCache: Map<string, LoadedProfile> = new Map()

/**
 * Get a loaded ICC profile by name from the cache
 */
export function getLoadedProfile(name: string): LoadedProfile | undefined {
  return loadedProfilesCache.get(name)
}

/**
 * Get all loaded ICC profiles from the cache
 */
export function getAllLoadedProfiles(): LoadedProfile[] {
  return Array.from(loadedProfilesCache.values())
}

/**
 * Clear the profile cache (call when closing profiles)
 */
export function clearProfileCache(): void {
  for (const profile of loadedProfilesCache.values()) {
    if (profile.handle && profile.handle !== 0) {
      closeProfile(profile)
    }
  }
  loadedProfilesCache.clear()
}

/**
 * Initialize the lcms-wasm module
 * Returns a promise that resolves to the LcmsWasm instance
 */
export async function initLcms(): Promise<LcmsWasm> {
  if (lcmsInstance) return lcmsInstance
  if (initPromise) return initPromise

  initPromise = (async () => {
    const lcms: LcmsWasm = await instantiate()
    lcmsInstance = lcms
    return lcms
  })()

  return initPromise
}

/**
 * Get the lcms instance synchronously (must be initialized first)
 */
export function getLcms(): LcmsWasm | null {
  return lcmsInstance
}

/**
 * Check if lcms is initialized
 */
export function isLcmsReady(): boolean {
  return lcmsInstance !== null
}

/**
 * Load an ICC profile from a buffer
 */
export async function loadProfileFromBuffer(
  buffer: ArrayBuffer | Uint8Array,
  name?: string
): Promise<LoadedProfile | null> {
  const lcms = await initLcms()
  const uint8Buffer = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)

  const handle = lcms.cmsOpenProfileFromMem(uint8Buffer, uint8Buffer.length)
  if (!handle) {
    console.error('Failed to open ICC profile from buffer')
    return null
  }

  // Get profile info
  const profileName = name || lcms.cmsGetProfileInfoASCII(handle, lcms.cmsInfoDescription, 'en', 'US') || 'Unknown'
  const colorSpaceSig = lcms.cmsGetColorSpaceASCII(handle)

  // Map color space signature to type
  let colorSpace: LoadedProfile['colorSpace'] = 'RGB'
  let profileType: LoadedProfile['type'] = 'rgb'

  if (colorSpaceSig === 'CMYK') {
    colorSpace = 'CMYK'
    profileType = 'cmyk'
  } else if (colorSpaceSig === 'XYZ ') {
    colorSpace = 'XYZ'
  } else if (colorSpaceSig === 'Lab ') {
    colorSpace = 'Lab'
  } else if (colorSpaceSig === 'RGB ') {
    colorSpace = 'RGB'
    profileType = 'rgb'
  }

  const loadedProfile: LoadedProfile = {
    name: profileName,
    handle,
    colorSpace,
    type: profileType
  }

  // Cache the loaded profile (only if not already cached or if re-loading)
  loadedProfilesCache.set(profileName, loadedProfile)

  return loadedProfile
}

/**
 * Load an ICC profile from a file path (Electron only)
 */
export async function loadProfileFromFile(filePath: string): Promise<LoadedProfile | null> {
  if (!window.electronAPI?.readFile) {
    console.error('Electron API not available for file reading')
    return null
  }

  try {
    const buffer = await window.electronAPI.readFile(filePath)
    const name = filePath.split(/[/\\]/).pop()?.replace(/\.icc$/i, '') || 'Custom Profile'
    return loadProfileFromBuffer(buffer, name)
  } catch (err) {
    console.error('Failed to read ICC profile file:', err)
    return null
  }
}

/**
 * Create a color transform between two profiles
 */
export function createTransform(
  sourceProfile: LoadedProfile,
  destProfile: LoadedProfile,
  intent: RenderingIntent = INTENT_PERCEPTUAL
): TransformHandle | null {
  const lcms = getLcms()
  if (!lcms) {
    console.error('lcms not initialized')
    return null
  }

  const sourceSpace = colorSpaceToSignature(sourceProfile.colorSpace)
  const destSpace = colorSpaceToSignature(destProfile.colorSpace)

  const transform = lcms.cmsCreateTransform(
    sourceProfile.handle,
    sourceSpace,
    destProfile.handle,
    destSpace,
    intent
  )

  return transform
}

/**
 * Convert color space signature string to lcms constant
 */
function colorSpaceToSignature(space: LoadedProfile['colorSpace']): ColorSpaceType {
  switch (space) {
    case 'CMYK': return CMS_SIG_CMYK
    case 'XYZ': return CMS_SIG_XYZ
    case 'Lab': return CMS_SIG_LAB
    default: return CMS_SIG_RGB
  }
}

/**
 * Perform color transform on a single RGB pixel
 */
export function transformRgbPixel(
  transform: TransformHandle,
  r: number,
  g: number,
  b: number
): { r: number; g: number; b: number } {
  const lcms = getLcms()
  if (!lcms) {
    return { r, g, b }
  }

  // Input RGB as [R, G, B, 0] (4 bytes for consistency)
  const input = new Uint8Array([r, g, b, 0])
  const output = new Uint8Array(4)

  lcms.cmsDoTransform(transform, input, output, 1)

  return { r: output[0], g: output[1], b: output[2] }
}

/**
 * Perform color transform on an entire image
 */
export function transformImage(
  transform: TransformHandle,
  imageData: ImageData
): ImageData {
  const lcms = getLcms()
  if (!lcms) {
    return imageData
  }

  const { width, height, data } = imageData
  const output = new Uint8ClampedArray(data.length)

  // Process 4 bytes at a time (RGBA)
  for (let i = 0; i < data.length; i += 4) {
    const input = new Uint8Array([data[i], data[i + 1], data[i + 2], data[i + 3]])
    const outputPixel = new Uint8Array(4)
    lcms.cmsDoTransform(transform, input, outputPixel, 1)

    output[i] = outputPixel[0]
    output[i + 1] = outputPixel[1]
    output[i + 2] = outputPixel[2]
    output[i + 3] = data[i + 3] // Keep original alpha
  }

  return { width, height, data: output } as ImageData
}

/**
 * Close a profile and release resources
 */
export function closeProfile(profile: LoadedProfile): void {
  const lcms = getLcms()
  if (lcms && profile.handle) {
    lcms.cmsCloseProfile(profile.handle)
  }
}

/**
 * Delete a transform and release resources
 */
export function deleteTransform(transform: TransformHandle): void {
  const lcms = getLcms()
  if (lcms && transform) {
    lcms.cmsDeleteTransform(transform)
  }
}

/**
 * Built-in sRGB profile placeholder
 * Note: In production, you would bundle a real sRGB ICC file
 */
export function createBuiltinSrgbProfile(): LoadedProfile {
  return {
    name: 'sRGB (Built-in)',
    handle: 0, // Special built-in handle
    colorSpace: 'RGB',
    type: 'rgb'
  }
}

/**
 * Create a real sRGB profile using lcms-wasm's built-in function
 * This eliminates the need for an external sRGB ICC file
 */
export function createSrgbProfile(): LoadedProfile | null {
  const lcms = getLcms()
  if (!lcms) {
    console.error('lcms not initialized, cannot create sRGB profile')
    return null
  }

  const handle = lcms.cmsCreate_sRGBProfile()
  if (!handle) {
    console.error('Failed to create sRGB profile via lcms')
    return null
  }

  const profile: LoadedProfile = {
    name: 'sRGB (Built-in)',
    handle,
    colorSpace: 'RGB',
    type: 'rgb'
  }

  // Cache the sRGB profile for reuse
  loadedProfilesCache.set('sRGB (Built-in)', profile)

  return profile
}

/**
 * Get or create the sRGB profile
 * Uses cached profile if available, otherwise creates via lcms-wasm
 */
export function getSrgbProfile(): LoadedProfile | null {
  const cached = getLoadedProfile('sRGB (Built-in)')
  if (cached) return cached
  return createSrgbProfile()
}

/**
 * Get color space display name
 */
export function getColorSpaceDisplayName(space: LoadedProfile['colorSpace']): string {
  switch (space) {
    case 'RGB': return 'RGB'
    case 'CMYK': return 'CMYK'
    case 'XYZ': return 'XYZ'
    case 'Lab': return 'CIE L*a*b*'
    default: return 'Unknown'
  }
}
