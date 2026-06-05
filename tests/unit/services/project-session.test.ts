import { describe, expect, it, vi } from 'vitest'
import type { ProjectData } from '../../../src/shared/types/electron'
import { createProjectSessionService } from '../../../src/renderer/services/project-session'

describe('project session service', () => {
  const projectData: ProjectData = {
    version: '1.1.0',
    settings: {
      projectName: 'Saved Project'
    }
  }

  it('save serializes current state and forwards it to electronAPI', async () => {
    const buildProjectData = vi.fn().mockResolvedValue(projectData)
    const saveProject = vi.fn().mockResolvedValue(true)
    const service = createProjectSessionService({
      buildProjectData,
      parseProjectData: vi.fn(),
      getProjectState: vi.fn().mockReturnValue({ projectName: 'Saved Project' }),
      getColorState: vi.fn().mockReturnValue({ softProofEnabled: false }),
      applyProjectState: vi.fn(),
      applyColorState: vi.fn(),
      saveProject,
      loadProject: vi.fn(),
      defaultProcessingOptions: {
        colorMode: 'rgb',
        resolution: 300,
        paperType: 'coated',
        simulateViewingConditions: true,
        viewingDistance: 250,
        lightSource: 'D50'
      }
    })

    const result = await service.save()

    expect(result).toBe(true)
    expect(buildProjectData).toHaveBeenCalledWith(
      { projectName: 'Saved Project' },
      { softProofEnabled: false }
    )
    expect(saveProject).toHaveBeenCalledWith(projectData)
  })

  it('load parses payload and applies project and color state', async () => {
    const parsed = {
      projectState: {
        projectName: 'Loaded Project',
        lastViewMode: 'preview',
        exportFormat: 'jpeg',
        exportSource: 'preview',
        aiTargetUse: 'brochure'
      },
      colorState: { softProofEnabled: true }
    }
    const applyProjectState = vi.fn()
    const applyColorState = vi.fn()
    const loadProject = vi.fn().mockResolvedValue(projectData)
    const parseProjectData = vi.fn().mockResolvedValue(parsed)
    const service = createProjectSessionService({
      buildProjectData: vi.fn(),
      parseProjectData,
      getProjectState: vi.fn(),
      getColorState: vi.fn(),
      applyProjectState,
      applyColorState,
      saveProject: vi.fn(),
      loadProject,
      defaultProcessingOptions: {
        colorMode: 'rgb',
        resolution: 300,
        paperType: 'coated',
        simulateViewingConditions: true,
        viewingDistance: 250,
        lightSource: 'D50'
      }
    })

    const result = await service.load()

    expect(result).toBe(true)
    expect(loadProject).toHaveBeenCalledOnce()
    expect(parseProjectData).toHaveBeenCalledWith(projectData, {
      colorMode: 'rgb',
      resolution: 300,
      paperType: 'coated',
      simulateViewingConditions: true,
      viewingDistance: 250,
      lightSource: 'D50'
    })
    expect(applyColorState).toHaveBeenCalledWith({ softProofEnabled: true })
    expect(applyProjectState).toHaveBeenCalledWith({
      projectName: 'Loaded Project',
      lastViewMode: 'preview',
      exportFormat: 'jpeg',
      exportSource: 'preview',
      aiTargetUse: 'brochure'
    })
  })

  it('reset restores default project state through the provided applier', () => {
    const applyProjectState = vi.fn()
    const applyColorState = vi.fn()
    const service = createProjectSessionService({
      buildProjectData: vi.fn(),
      parseProjectData: vi.fn(),
      getProjectState: vi.fn(),
      getColorState: vi.fn(),
      applyProjectState,
      applyColorState,
      saveProject: vi.fn(),
      loadProject: vi.fn(),
      defaultProcessingOptions: {
        colorMode: 'rgb',
        resolution: 300,
        paperType: 'coated',
        simulateViewingConditions: true,
        viewingDistance: 250,
        lightSource: 'D50'
      }
    })

    service.reset()

    expect(applyColorState).toHaveBeenCalledWith({
      activeProfile: null,
      analysis: null,
      softProofEnabled: false
    })
    expect(applyProjectState).toHaveBeenCalledWith({
      projectName: 'Untitled Project',
      originalImage: null,
      processedImage: null,
      processingOptions: {
        colorMode: 'rgb',
        resolution: 300,
        paperType: 'coated',
        simulateViewingConditions: true,
        viewingDistance: 250,
        lightSource: 'D50'
      },
      aiAdvice: null,
      lastViewMode: 'import',
      exportFormat: 'png',
      exportSource: 'original',
      aiTargetUse: 'general'
    })
  })
})
