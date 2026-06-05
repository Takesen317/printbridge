import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ICCProfile, ColorAnalysis } from '../services/color-engine'

interface ColorState {
  activeProfile: ICCProfile | null
  analysis: ColorAnalysis | null
  softProofEnabled: boolean
  warningThreshold: number
  customProfiles: ICCProfile[]
  iccEngineStatus: 'ready' | 'degraded' | 'initializing'
  setActiveProfile: (profile: ICCProfile | null) => void
  setAnalysis: (analysis: ColorAnalysis | null) => void
  toggleSoftProof: () => void
  setWarningThreshold: (threshold: number) => void
  addCustomProfile: (profile: ICCProfile) => void
  removeCustomProfile: (name: string) => void
  setIccEngineStatus: (status: 'ready' | 'degraded' | 'initializing') => void
}

export const useColorStore = create<ColorState>()(
  persist(
    (set) => ({
      activeProfile: null,
      analysis: null,
      softProofEnabled: false,
      warningThreshold: 3,
      customProfiles: [],
      iccEngineStatus: 'initializing',

      setActiveProfile: (profile) => set({ activeProfile: profile }),
      setAnalysis: (analysis) => set({ analysis }),
      toggleSoftProof: () => set((state) => ({ softProofEnabled: !state.softProofEnabled })),
      setWarningThreshold: (threshold) => set({ warningThreshold: threshold }),
      addCustomProfile: (profile) =>
        set((state) => ({
          customProfiles: [...state.customProfiles.filter((item) => item.name !== profile.name), profile]
        })),
      removeCustomProfile: (name) =>
        set((state) => ({
          customProfiles: state.customProfiles.filter((profile) => profile.name !== name),
          activeProfile: state.activeProfile?.name === name ? null : state.activeProfile
        })),
      setIccEngineStatus: (status) => set({ iccEngineStatus: status })
    }),
    {
      name: 'printbridge-color',
      partialize: (state) => ({
        softProofEnabled: state.softProofEnabled,
        warningThreshold: state.warningThreshold,
        customProfiles: state.customProfiles
      })
    }
  )
)
