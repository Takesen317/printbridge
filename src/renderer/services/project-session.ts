import type { ProjectColorSerializationState, ProjectSerializationState } from './project-serializer'
import { buildProjectData, parseProjectData } from './project-serializer'
import type { ImageProcessorOptions } from './image-processor'

export interface ProjectSessionService {
  reset: () => void
  save: () => Promise<boolean>
  load: () => Promise<boolean>
}

interface ProjectSessionDependencies {
  buildProjectData: typeof buildProjectData
  parseProjectData: typeof parseProjectData
  getProjectState: () => ProjectSerializationState
  getColorState: () => ProjectColorSerializationState
  applyProjectState: (state: ProjectSerializationState) => void
  applyColorState: (state: ProjectColorSerializationState) => void
  saveProject?: (data: Awaited<ReturnType<typeof buildProjectData>>) => Promise<boolean>
  loadProject?: () => Promise<Awaited<ReturnType<typeof buildProjectData>> | null>
  defaultProcessingOptions: ImageProcessorOptions
}

export function createDefaultProjectState(
  defaultProcessingOptions: ImageProcessorOptions
): ProjectSerializationState {
  return {
    projectName: 'Untitled Project',
    originalImage: null,
    processedImage: null,
    processingOptions: defaultProcessingOptions,
    aiAdvice: null,
    lastViewMode: 'import',
    exportFormat: 'png',
    exportSource: 'original',
    aiTargetUse: 'general'
  }
}

export function createProjectSessionService({
  buildProjectData,
  parseProjectData,
  getProjectState,
  getColorState,
  applyProjectState,
  applyColorState,
  saveProject,
  loadProject,
  defaultProcessingOptions
}: ProjectSessionDependencies): ProjectSessionService {
  return {
    reset: () => {
      applyColorState({
        activeProfile: null,
        analysis: null,
        softProofEnabled: false
      })
      applyProjectState(createDefaultProjectState(defaultProcessingOptions))
    },

    save: async () => {
      try {
        if (!saveProject) return false

        const data = await buildProjectData(getProjectState(), getColorState())
        return await saveProject(data)
      } catch (err) {
        console.error('Failed to save project:', err)
        return false
      }
    },

    load: async () => {
      try {
        if (!loadProject) return false

        const data = await loadProject()
        if (!data) return false

        const parsed = await parseProjectData(data, defaultProcessingOptions)
        applyColorState(parsed.colorState)
        applyProjectState(parsed.projectState)

        return true
      } catch (err) {
        console.error('Failed to load project:', err)
        return false
      }
    }
  }
}
