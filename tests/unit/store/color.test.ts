import { beforeEach, describe, expect, it } from 'vitest'
import type { ColorAnalysis, ICCProfile } from '../../../src/renderer/services/color-engine'
import { useColorStore } from '../../../src/renderer/store/color'

describe('color store', () => {
  const testProfile: ICCProfile = {
    name: 'sRGB',
    description: 'Standard RGB',
    type: 'rgb'
  }

  const testAnalysis: ColorAnalysis = {
    representativeColor: { r: 128, g: 128, b: 128 },
    convertedColor: { c: 0, m: 0, y: 0, k: 50 },
    averageDeltaE: 2.5,
    maxDeltaE: 10.2,
    isInGamut: true,
    inGamutPercentage: 95.5,
    sampleCount: 25
  }

  beforeEach(() => {
    useColorStore.setState({
      activeProfile: null,
      analysis: null,
      softProofEnabled: false,
      warningThreshold: 3,
      customProfiles: [],
      iccEngineStatus: 'initializing',
      setActiveProfile: useColorStore.getState().setActiveProfile,
      setAnalysis: useColorStore.getState().setAnalysis,
      toggleSoftProof: useColorStore.getState().toggleSoftProof,
      setWarningThreshold: useColorStore.getState().setWarningThreshold,
      addCustomProfile: useColorStore.getState().addCustomProfile,
      removeCustomProfile: useColorStore.getState().removeCustomProfile,
      setIccEngineStatus: useColorStore.getState().setIccEngineStatus
    })
  })

  it('has correct initial state', () => {
    const state = useColorStore.getState()
    expect(state.activeProfile).toBeNull()
    expect(state.analysis).toBeNull()
    expect(state.softProofEnabled).toBe(false)
    expect(state.warningThreshold).toBe(3)
    expect(state.customProfiles).toEqual([])
    expect(state.iccEngineStatus).toBe('initializing')
  })

  it('setActiveProfile updates activeProfile', () => {
    useColorStore.getState().setActiveProfile(testProfile)
    expect(useColorStore.getState().activeProfile).toBe(testProfile)
  })

  it('setActiveProfile accepts null for reset flows', () => {
    useColorStore.getState().setActiveProfile(testProfile)
    useColorStore.getState().setActiveProfile(null)
    expect(useColorStore.getState().activeProfile).toBeNull()
  })

  it('setAnalysis updates analysis', () => {
    useColorStore.getState().setAnalysis(testAnalysis)
    expect(useColorStore.getState().analysis).toBe(testAnalysis)
  })

  it('setAnalysis accepts null when clearing project state', () => {
    useColorStore.getState().setAnalysis(testAnalysis)
    useColorStore.getState().setAnalysis(null)
    expect(useColorStore.getState().analysis).toBeNull()
  })

  it('toggleSoftProof toggles boolean value', () => {
    const store = useColorStore.getState()
    expect(store.softProofEnabled).toBe(false)
    store.toggleSoftProof()
    expect(useColorStore.getState().softProofEnabled).toBe(true)
    store.toggleSoftProof()
    expect(useColorStore.getState().softProofEnabled).toBe(false)
  })

  it('setWarningThreshold updates threshold value', () => {
    useColorStore.getState().setWarningThreshold(5)
    expect(useColorStore.getState().warningThreshold).toBe(5)
  })

  it('addCustomProfile deduplicates by profile name', () => {
    const store = useColorStore.getState()
    store.addCustomProfile({ ...testProfile, isCustom: true })
    store.addCustomProfile({ ...testProfile, description: 'Updated', isCustom: true })
    expect(useColorStore.getState().customProfiles).toHaveLength(1)
    expect(useColorStore.getState().customProfiles[0].description).toBe('Updated')
  })

  it('removeCustomProfile clears matching active profile', () => {
    const customProfile: ICCProfile = { ...testProfile, name: 'Custom', isCustom: true }
    const store = useColorStore.getState()
    store.addCustomProfile(customProfile)
    store.setActiveProfile(customProfile)
    store.removeCustomProfile('Custom')

    expect(useColorStore.getState().customProfiles).toEqual([])
    expect(useColorStore.getState().activeProfile).toBeNull()
  })

  it('setIccEngineStatus updates the current engine state', () => {
    useColorStore.getState().setIccEngineStatus('ready')
    expect(useColorStore.getState().iccEngineStatus).toBe('ready')
  })
})
