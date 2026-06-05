import type { ProjectData } from '../../shared/types/electron'
import type { AIColorAdvice, AIColorAnalysisRequest } from './ai-color-advisor'
import type { ICCProfile, ColorAnalysis } from './color-engine'
import type { ImageProcessorOptions } from './image-processor'

export type ProjectViewMode = 'import' | 'analyze' | 'preview'
export type ProjectExportFormat = 'png' | 'jpeg' | 'tiff'
export type ProjectExportSource = 'original' | 'preview'

export interface ProjectSerializationState {
  projectName: string
  originalImage: ImageData | null
  processedImage: ImageData | null
  processingOptions: ImageProcessorOptions
  aiAdvice: AIColorAdvice | null
  lastViewMode: ProjectViewMode
  exportFormat: ProjectExportFormat
  exportSource: ProjectExportSource
  aiTargetUse: AIColorAnalysisRequest['targetUse']
}

export interface ProjectColorSerializationState {
  activeProfile: ICCProfile | null
  analysis: ColorAnalysis | null
  softProofEnabled: boolean
}

export interface ParsedProjectData {
  projectState: ProjectSerializationState
  colorState: ProjectColorSerializationState
}

async function imageDataToBuffer(imageData: ImageData | null): Promise<Uint8Array | undefined> {
  if (!imageData) return undefined

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = imageData.width
    canvas.height = imageData.height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      resolve(undefined)
      return
    }

    ctx.putImageData(imageData, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(undefined)
        return
      }

      blob.arrayBuffer().then((buffer) => resolve(new Uint8Array(buffer)))
    }, 'image/png')
  })
}

async function bufferToImageData(imageBuffer: Uint8Array): Promise<ImageData | null> {
  const blob = new Blob([Uint8Array.from(imageBuffer)], { type: 'image/png' })
  const img = new Image()

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(blob)
  })

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.drawImage(img, 0, 0)
  return ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight)
}

export async function buildProjectData(
  state: ProjectSerializationState,
  colorState: ProjectColorSerializationState
): Promise<ProjectData> {
  const imageBuffer = await imageDataToBuffer(state.processedImage || state.originalImage)

  return {
    version: '1.1.0',
    imageBuffer,
    settings: {
      projectName: state.projectName,
      processingOptions: state.processingOptions,
      activeProfile: colorState.activeProfile,
      analysis: colorState.analysis,
      aiAdvice: state.aiAdvice,
      lastViewMode: state.lastViewMode,
      exportFormat: state.exportFormat,
      exportSource: state.exportSource,
      aiTargetUse: state.aiTargetUse,
      softProofEnabled: colorState.softProofEnabled
    }
  }
}

export async function parseProjectData(
  data: ProjectData,
  defaultProcessingOptions: ImageProcessorOptions
): Promise<ParsedProjectData> {
  const settings = data.settings
  const imageData = data.imageBuffer?.length ? await bufferToImageData(data.imageBuffer) : null
  const processingOptions = settings.processingOptions
    ? { ...defaultProcessingOptions, ...settings.processingOptions }
    : defaultProcessingOptions

  return {
    projectState: {
      projectName: settings.projectName || 'Loaded Project',
      originalImage: imageData,
      processedImage: imageData,
      processingOptions,
      aiAdvice: settings.aiAdvice || null,
      lastViewMode: settings.lastViewMode || 'import',
      exportFormat: settings.exportFormat || 'png',
      exportSource: settings.exportSource || 'original',
      aiTargetUse: settings.aiTargetUse || 'general'
    },
    colorState: {
      activeProfile: settings.activeProfile || null,
      analysis: settings.analysis || null,
      softProofEnabled: settings.softProofEnabled === true
    }
  }
}
