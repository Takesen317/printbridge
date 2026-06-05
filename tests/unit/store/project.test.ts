import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AIColorAdvice } from '../../../src/renderer/services/ai-color-advisor'
import type { ColorAnalysis, ICCProfile } from '../../../src/renderer/services/color-engine'
import type { ImageProcessorOptions } from '../../../src/renderer/services/image-processor'
import { buildProjectData, parseProjectData } from '../../../src/renderer/services/project-serializer'
import { useColorStore } from '../../../src/renderer/store/color'
import { useProjectStore } from '../../../src/renderer/store/project'

describe('project store', () => {
  const testProfile: ICCProfile = {
    name: 'FOGRA39',
    description: 'Coated CMYK',
    type: 'cmyk'
  }

  const testAnalysis: ColorAnalysis = {
    representativeColor: { r: 64, g: 96, b: 128 },
    convertedColor: { c: 50, m: 25, y: 0, k: 50 },
    averageDeltaE: 1.9,
    maxDeltaE: 4.2,
    isInGamut: true,
    inGamutPercentage: 98,
    sampleCount: 12
  }

  const defaultOptions: ImageProcessorOptions = {
    colorMode: 'rgb',
    resolution: 300,
    paperType: 'coated',
    simulateViewingConditions: true,
    viewingDistance: 250,
    lightSource: 'D50'
  }

  const testAdvice: AIColorAdvice = {
    recommendedProfile: 'sRGB',
    profileType: 'rgb',
    colorTemperature: 'neutral',
    saturation: 'medium',
    contrast: 'normal',
    reasoning: 'Test reasoning',
    printingTips: ['tip1'],
    source: 'rule-based',
    confidence: 'low',
    approximationNotice: 'Fallback used'
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

    useProjectStore.setState({
      projectName: 'Untitled Project',
      originalImage: null,
      processedImage: null,
      processingOptions: defaultOptions,
      aiAdvice: null,
      lastViewMode: 'import',
      exportFormat: 'png',
      exportSource: 'original',
      aiTargetUse: 'general',
      setProjectName: useProjectStore.getState().setProjectName,
      setOriginalImage: useProjectStore.getState().setOriginalImage,
      setProcessedImage: useProjectStore.getState().setProcessedImage,
      updateProcessingOptions: useProjectStore.getState().updateProcessingOptions,
      setAiAdvice: useProjectStore.getState().setAiAdvice,
      setLastViewMode: useProjectStore.getState().setLastViewMode,
      setExportFormat: useProjectStore.getState().setExportFormat,
      setExportSource: useProjectStore.getState().setExportSource,
      setAiTargetUse: useProjectStore.getState().setAiTargetUse,
      resetProject: useProjectStore.getState().resetProject,
      saveProjectToFile: useProjectStore.getState().saveProjectToFile,
      loadProjectFromFile: useProjectStore.getState().loadProjectFromFile
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete (window as any).electronAPI
  })

  it('has correct initial state', () => {
    const state = useProjectStore.getState()
    expect(state.projectName).toBe('Untitled Project')
    expect(state.originalImage).toBeNull()
    expect(state.processedImage).toBeNull()
    expect(state.processingOptions).toEqual(defaultOptions)
    expect(state.aiAdvice).toBeNull()
    expect(state.lastViewMode).toBe('import')
    expect(state.exportFormat).toBe('png')
    expect(state.exportSource).toBe('original')
    expect(state.aiTargetUse).toBe('general')
  })

  it('setProjectName updates project name', () => {
    useProjectStore.getState().setProjectName('My Project')
    expect(useProjectStore.getState().projectName).toBe('My Project')
  })

  it('updateProcessingOptions merges options', () => {
    useProjectStore.getState().updateProcessingOptions({ colorMode: 'cmyk', resolution: 150 })

    const newOptions = useProjectStore.getState().processingOptions
    expect(newOptions.colorMode).toBe('cmyk')
    expect(newOptions.resolution).toBe(150)
    expect(newOptions.paperType).toBe('coated')
    expect(newOptions.viewingDistance).toBe(250)
  })

  it('setAiAdvice stores analysis advice', () => {
    useProjectStore.getState().setAiAdvice(testAdvice)
    expect(useProjectStore.getState().aiAdvice).toEqual(testAdvice)
  })

  it('setLastViewMode updates the active view mode', () => {
    useProjectStore.getState().setLastViewMode('preview')
    expect(useProjectStore.getState().lastViewMode).toBe('preview')
  })

  it('export settings can be updated independently', () => {
    const store = useProjectStore.getState()
    store.setExportFormat('tiff')
    store.setExportSource('preview')

    expect(useProjectStore.getState().exportFormat).toBe('tiff')
    expect(useProjectStore.getState().exportSource).toBe('preview')
  })

  it('AI target use is persisted in store state', () => {
    useProjectStore.getState().setAiTargetUse('packaging')
    expect(useProjectStore.getState().aiTargetUse).toBe('packaging')
  })

  it('resetProject restores default state', () => {
    const store = useProjectStore.getState()
    store.setProjectName('Changed Project')
    store.updateProcessingOptions({ colorMode: 'cmyk', resolution: 72 })
    store.setAiAdvice(testAdvice)
    store.setLastViewMode('analyze')
    store.setExportFormat('jpeg')
    store.setExportSource('preview')
    store.setAiTargetUse('brochure')
    const colorStore = useColorStore.getState()
    colorStore.setActiveProfile(testProfile)
    colorStore.setAnalysis(testAnalysis)
    colorStore.toggleSoftProof()
    store.resetProject()

    const state = useProjectStore.getState()
    expect(state.projectName).toBe('Untitled Project')
    expect(state.processingOptions).toEqual(defaultOptions)
    expect(state.originalImage).toBeNull()
    expect(state.processedImage).toBeNull()
    expect(state.aiAdvice).toBeNull()
    expect(state.lastViewMode).toBe('import')
    expect(state.exportFormat).toBe('png')
    expect(state.exportSource).toBe('original')
    expect(state.aiTargetUse).toBe('general')
    expect(useColorStore.getState()).toMatchObject({
      activeProfile: null,
      analysis: null,
      softProofEnabled: false
    })
  })

  it('saveProjectToFile returns false when electronAPI is not available', async () => {
    const originalAPI = (window as any).electronAPI
    ;(window as any).electronAPI = undefined

    const result = await useProjectStore.getState().saveProjectToFile()
    expect(result).toBe(false)

    ;(window as any).electronAPI = originalAPI
  })

  it('loadProjectFromFile returns false when electronAPI is not available', async () => {
    const originalAPI = (window as any).electronAPI
    ;(window as any).electronAPI = undefined

    const result = await useProjectStore.getState().loadProjectFromFile()
    expect(result).toBe(false)

    ;(window as any).electronAPI = originalAPI
  })

  it('saveProjectToFile serializes project and color settings into the project payload', async () => {
    const data = await buildProjectData(
      {
        projectName: 'Client Brochure',
        processedImage: null,
        originalImage: null,
        processingOptions: {
          ...defaultOptions,
          colorMode: 'cmyk',
          resolution: 150
        },
        aiAdvice: testAdvice,
        lastViewMode: 'preview',
        exportFormat: 'jpeg',
        exportSource: 'preview',
        aiTargetUse: 'brochure'
      },
      {
        activeProfile: testProfile,
        analysis: testAnalysis,
        softProofEnabled: true
      }
    )

    expect(data).toEqual({
      version: '1.1.0',
      imageBuffer: undefined,
      settings: {
        projectName: 'Client Brochure',
        processingOptions: {
          ...defaultOptions,
          colorMode: 'cmyk',
          resolution: 150
        },
        activeProfile: testProfile,
        analysis: testAnalysis,
        aiAdvice: testAdvice,
        lastViewMode: 'preview',
        exportFormat: 'jpeg',
        exportSource: 'preview',
        aiTargetUse: 'brochure',
        softProofEnabled: true
      }
    })
  })

  it('loadProjectFromFile parses project payload into project and color store state', async () => {
    const parsed = await parseProjectData(
      {
        version: '1.1.0',
        settings: {
          projectName: 'Loaded Project',
          processingOptions: {
            ...defaultOptions,
            paperType: 'uncoated',
            lightSource: 'D65'
          },
          activeProfile: testProfile,
          analysis: testAnalysis,
          aiAdvice: testAdvice,
          lastViewMode: 'analyze',
          exportFormat: 'tiff',
          exportSource: 'preview',
          aiTargetUse: 'packaging',
          softProofEnabled: true
        }
      },
      defaultOptions
    )

    expect(parsed.projectState).toMatchObject({
      projectName: 'Loaded Project',
      originalImage: null,
      processedImage: null,
      processingOptions: {
        ...defaultOptions,
        paperType: 'uncoated',
        lightSource: 'D65'
      },
      aiAdvice: testAdvice,
      lastViewMode: 'analyze',
      exportFormat: 'tiff',
      exportSource: 'preview',
      aiTargetUse: 'packaging'
    })
    expect(parsed.colorState).toEqual({
      activeProfile: testProfile,
      analysis: testAnalysis,
      softProofEnabled: true
    })
  })

  it('parseProjectData merges partial processing options with defaults', async () => {
    const parsed = await parseProjectData(
      {
        version: '1.1.0',
        settings: {
          processingOptions: {
            resolution: 144
          }
        }
      },
      defaultOptions
    )

    expect(parsed.projectState.processingOptions).toEqual({
      ...defaultOptions,
      resolution: 144
    })
  })

  it('saveProjectToFile passes serializer output to electronAPI', async () => {
    const saveProject = vi.fn().mockResolvedValue(true)
    ;(window as any).electronAPI = { saveProject }

    const store = useProjectStore.getState()
    store.setProjectName('Client Brochure')
    store.updateProcessingOptions({ colorMode: 'cmyk', resolution: 150 })
    store.setAiAdvice(testAdvice)
    store.setLastViewMode('preview')
    store.setExportFormat('jpeg')
    store.setExportSource('preview')
    store.setAiTargetUse('brochure')

    const colorStore = useColorStore.getState()
    colorStore.setActiveProfile(testProfile)
    colorStore.setAnalysis(testAnalysis)
    colorStore.toggleSoftProof()

    const result = await store.saveProjectToFile()

    expect(result).toBe(true)
    expect(saveProject).toHaveBeenCalledOnce()
  })

  it('loadProjectFromFile applies parsed project payload to both stores', async () => {
    ;(window as any).electronAPI = {
      loadProject: vi.fn().mockResolvedValue({
        version: '1.1.0',
        settings: {
          projectName: 'Loaded Project',
          processingOptions: {
            ...defaultOptions,
            paperType: 'uncoated',
            lightSource: 'D65'
          },
          activeProfile: testProfile,
          analysis: testAnalysis,
          aiAdvice: testAdvice,
          lastViewMode: 'analyze',
          exportFormat: 'tiff',
          exportSource: 'preview',
          aiTargetUse: 'packaging',
          softProofEnabled: true
        }
      })
    }

    const result = await useProjectStore.getState().loadProjectFromFile()

    expect(result).toBe(true)
    expect(useProjectStore.getState()).toMatchObject({
      projectName: 'Loaded Project',
      originalImage: null,
      processedImage: null,
      processingOptions: {
        ...defaultOptions,
        paperType: 'uncoated',
        lightSource: 'D65'
      },
      aiAdvice: testAdvice,
      lastViewMode: 'analyze',
      exportFormat: 'tiff',
      exportSource: 'preview',
      aiTargetUse: 'packaging'
    })
    expect(useColorStore.getState()).toMatchObject({
      activeProfile: testProfile,
      analysis: testAnalysis,
      softProofEnabled: true
    })
  })

  it('loadProjectFromFile restores key workflow context fields from a minimal persisted payload', async () => {
    ;(window as any).electronAPI = {
      loadProject: vi.fn().mockResolvedValue({
        version: '1.1.0',
        settings: {
          lastViewMode: 'preview',
          exportFormat: 'jpeg',
          exportSource: 'preview',
          aiTargetUse: 'brochure'
        }
      })
    }

    const result = await useProjectStore.getState().loadProjectFromFile()

    expect(result).toBe(true)
    expect(useProjectStore.getState()).toMatchObject({
      lastViewMode: 'preview',
      exportFormat: 'jpeg',
      exportSource: 'preview',
      aiTargetUse: 'brochure'
    })
  })

  it('loadProjectFromFile does not toggle soft proof when persisted state already matches', async () => {
    useColorStore.setState({ softProofEnabled: true })
    const originalToggleSoftProof = useColorStore.getState().toggleSoftProof
    const toggleSoftProof = vi.fn(() => originalToggleSoftProof())
    useColorStore.setState({ toggleSoftProof })

    ;(window as any).electronAPI = {
      loadProject: vi.fn().mockResolvedValue({
        version: '1.1.0',
        settings: {
          softProofEnabled: true
        }
      })
    }

    const result = await useProjectStore.getState().loadProjectFromFile()

    expect(result).toBe(true)
    expect(toggleSoftProof).not.toHaveBeenCalled()
    expect(useColorStore.getState().softProofEnabled).toBe(true)
  })

  it('loadProjectFromFile toggles soft proof once when persisted state differs', async () => {
    const originalToggleSoftProof = useColorStore.getState().toggleSoftProof
    const toggleSoftProof = vi.fn(() => originalToggleSoftProof())
    useColorStore.setState({ softProofEnabled: false, toggleSoftProof })

    ;(window as any).electronAPI = {
      loadProject: vi.fn().mockResolvedValue({
        version: '1.1.0',
        settings: {
          softProofEnabled: true
        }
      })
    }

    const result = await useProjectStore.getState().loadProjectFromFile()

    expect(result).toBe(true)
    expect(toggleSoftProof).toHaveBeenCalledOnce()
    expect(useColorStore.getState().softProofEnabled).toBe(true)
  })
})
