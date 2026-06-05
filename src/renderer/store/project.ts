import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AIColorAdvice, AIColorAnalysisRequest } from '../services/ai-color-advisor'
import type { ImageProcessorOptions } from '../services/image-processor'
import {
  buildProjectData,
  parseProjectData,
  type ProjectExportFormat,
  type ProjectExportSource,
  type ProjectSerializationState,
  type ProjectViewMode
} from '../services/project-serializer'
import { createProjectSessionService, createDefaultProjectState } from '../services/project-session'
import { useColorStore } from './color'

interface ProjectState {
  projectName: string
  originalImage: ImageData | null
  processedImage: ImageData | null
  processingOptions: ImageProcessorOptions
  aiAdvice: AIColorAdvice | null
  lastViewMode: ProjectViewMode
  exportFormat: ProjectExportFormat
  exportSource: ProjectExportSource
  aiTargetUse: AIColorAnalysisRequest['targetUse']
  setProjectName: (name: string) => void
  setOriginalImage: (image: ImageData) => void
  setProcessedImage: (image: ImageData) => void
  updateProcessingOptions: (options: Partial<ImageProcessorOptions>) => void
  setAiAdvice: (advice: AIColorAdvice | null) => void
  setLastViewMode: (mode: ProjectViewMode) => void
  setExportFormat: (format: ProjectExportFormat) => void
  setExportSource: (source: ProjectExportSource) => void
  setAiTargetUse: (targetUse: AIColorAnalysisRequest['targetUse']) => void
  resetProject: () => void
  saveProjectToFile: () => Promise<boolean>
  loadProjectFromFile: () => Promise<boolean>
}

const defaultOptions: ImageProcessorOptions = {
  colorMode: 'rgb',
  resolution: 300,
  paperType: 'coated',
  simulateViewingConditions: true,
  viewingDistance: 250,
  lightSource: 'D50'
}

function syncColorStoreFromProject(data: { activeProfile: ReturnType<typeof useColorStore.getState>['activeProfile']; analysis: ReturnType<typeof useColorStore.getState>['analysis']; softProofEnabled: boolean }) {
  const colorStore = useColorStore.getState()
  colorStore.setActiveProfile(data.activeProfile)
  colorStore.setAnalysis(data.analysis)
  if (typeof data.softProofEnabled === 'boolean' && colorStore.softProofEnabled !== data.softProofEnabled) {
    colorStore.toggleSoftProof()
  }
}

function getProjectSerializationState(state: ProjectState): ProjectSerializationState {
  return {
    projectName: state.projectName,
    originalImage: state.originalImage,
    processedImage: state.processedImage,
    processingOptions: state.processingOptions,
    aiAdvice: state.aiAdvice,
    lastViewMode: state.lastViewMode,
    exportFormat: state.exportFormat,
    exportSource: state.exportSource,
    aiTargetUse: state.aiTargetUse
  }
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      ...createDefaultProjectState(defaultOptions),

      setProjectName: (name) => set({ projectName: name }),
      setOriginalImage: (image) => set({ originalImage: image }),
      setProcessedImage: (image) => set({ processedImage: image }),
      updateProcessingOptions: (options) =>
        set((state) => ({
          processingOptions: { ...state.processingOptions, ...options }
        })),
      setAiAdvice: (advice) => set({ aiAdvice: advice }),
      setLastViewMode: (mode) => set({ lastViewMode: mode }),
      setExportFormat: (format) => set({ exportFormat: format }),
      setExportSource: (source) => set({ exportSource: source }),
      setAiTargetUse: (targetUse) => set({ aiTargetUse: targetUse }),
      resetProject: () => projectSessionService.reset(),

      saveProjectToFile: async () => projectSessionService.save(),

      loadProjectFromFile: async () => projectSessionService.load()
    }),
    {
      name: 'printbridge-project',
      partialize: (state) => ({
        projectName: state.projectName,
        processingOptions: state.processingOptions,
        aiAdvice: state.aiAdvice,
        lastViewMode: state.lastViewMode,
        exportFormat: state.exportFormat,
        exportSource: state.exportSource,
        aiTargetUse: state.aiTargetUse
      })
    }
  )
)

const projectSessionService = createProjectSessionService({
  buildProjectData,
  parseProjectData,
  getProjectState: () => getProjectSerializationState(useProjectStore.getState()),
  getColorState: () => {
    const colorState = useColorStore.getState()

    return {
      activeProfile: colorState.activeProfile,
      analysis: colorState.analysis,
      softProofEnabled: colorState.softProofEnabled
    }
  },
  applyProjectState: (state) => useProjectStore.setState(state),
  applyColorState: (state) => syncColorStoreFromProject(state),
  saveProject: (data) => {
    if (!window.electronAPI?.saveProject) return Promise.resolve(false)
    return window.electronAPI.saveProject(data)
  },
  loadProject: () => {
    if (!window.electronAPI?.loadProject) return Promise.resolve(null)
    return window.electronAPI.loadProject()
  },
  defaultProcessingOptions: defaultOptions
})
