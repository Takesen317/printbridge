import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ICCProfile, ColorAnalysis } from '../services/color-engine'

interface ColorState {
  activeProfile: ICCProfile | null
  analysis: ColorAnalysis | null
  softProofEnabled: boolean
  warningThreshold: number
  customProfiles: ICCProfile[]
  iccEngineStatus: 'ready' | 'degraded' | 'initializing'

  setActiveProfile: (profile: ICCProfile) => void
  setAnalysis: (analysis: ColorAnalysis) => void
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
      addCustomProfile: (profile) => set((state) => ({
        customProfiles: [...state.customProfiles.filter(p => p.name !== profile.name), profile]
      })),
      removeCustomProfile: (name) => set((state) => ({
        customProfiles: state.customProfiles.filter(p => p.name !== name),
        activeProfile: state.activeProfile?.name === name ? null : state.activeProfile
      })),
      setIccEngineStatus: (status) => set({ iccEngineStatus: status })
    }),
    {
      name: 'printbridge-color',
      // 只持久化简单设置项，分析结果每次加载图像重新计算
      partialize: (state) => ({
        softProofEnabled: state.softProofEnabled,
        warningThreshold: state.warningThreshold,
        customProfiles: state.customProfiles
        // activeProfile 和 analysis 不持久化（需要从图像重新获取）
        // iccEngineStatus 不持久化（每次启动时重新初始化）
      })
    }
  )
)
