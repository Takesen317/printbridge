import { describe, it, expect } from 'vitest'
import {
  isLcmsReady,
  getLcms,
  clearProfileCache,
  getLoadedProfile,
  getAllLoadedProfiles,
  createBuiltinSrgbProfile
} from '../../../src/renderer/services/icc-handler'

describe('icc-handler', () => {
  describe('isLcmsReady', () => {
    it('returns boolean', () => {
      const result = isLcmsReady()
      expect(typeof result).toBe('boolean')
    })

    it('returns false when lcms is not initialized', () => {
      // Before any async init, should be false
      expect(isLcmsReady()).toBe(false)
    })
  })

  describe('getLcms', () => {
    it('returns null when not initialized', () => {
      const result = getLcms()
      expect(result).toBe(null)
    })
  })

  describe('clearProfileCache', () => {
    it('clears the profile cache without error', () => {
      // Should not throw even with empty cache
      expect(() => clearProfileCache()).not.toThrow()
    })
  })

  describe('getLoadedProfile', () => {
    it('returns undefined for non-existent profile', () => {
      const result = getLoadedProfile('nonexistent')
      expect(result).toBeUndefined()
    })
  })

  describe('getAllLoadedProfiles', () => {
    it('returns empty array when no profiles loaded', () => {
      // Clear cache first
      clearProfileCache()
      const result = getAllLoadedProfiles()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })
  })

  describe('createBuiltinSrgbProfile', () => {
    it('returns a profile object with required fields', () => {
      const profile = createBuiltinSrgbProfile()
      expect(profile).toHaveProperty('name')
      expect(profile).toHaveProperty('handle')
      expect(profile).toHaveProperty('colorSpace')
      expect(profile).toHaveProperty('type')
    })

    it('returns profile with rgb type', () => {
      const profile = createBuiltinSrgbProfile()
      expect(profile.type).toBe('rgb')
    })

    it('returns profile with RGB colorSpace', () => {
      const profile = createBuiltinSrgbProfile()
      expect(profile.colorSpace).toBe('RGB')
    })

    it('returns profile with built-in handle (0)', () => {
      const profile = createBuiltinSrgbProfile()
      expect(profile.handle).toBe(0)
    })

    it('returns profile with sRGB name', () => {
      const profile = createBuiltinSrgbProfile()
      expect(profile.name).toBe('sRGB (Built-in)')
    })
  })
})