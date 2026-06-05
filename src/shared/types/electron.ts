import type { MenuAction } from '../constants/menu'
import type { ColorAnalysis, ICCProfile } from '../../renderer/services/color-engine'
import type { AIColorAdvice, AIColorAnalysisRequest } from '../../renderer/services/ai-color-advisor'
import type { ImageProcessorOptions } from '../../renderer/services/image-processor'

/**
 * Shared type definitions for Electron API
 * Used by both preload and renderer processes
 */

export interface FileFilter {
  name: string
  extensions: string[]
}

export interface ElectronAPI {
  openFile: (options?: { filters?: FileFilter[] }) => Promise<{ filePath: string; buffer: Uint8Array } | null>
  saveFile: (data: Uint8Array, options?: { extension?: string }) => Promise<boolean>
  readFile: (filePath: string) => Promise<Uint8Array>
  processImage: (buffer: Uint8Array, options: ProcessOptions) => Promise<Uint8Array>
  loadProject: () => Promise<ProjectData | null>
  saveProject: (data: ProjectData) => Promise<boolean>
  onMenuAction: (callback: (action: MenuAction) => void) => () => void
}

export interface ProcessOptions {
  colorMode?: 'rgb' | 'cmyk'
  resolution?: number
  addBleed?: boolean
}

export interface ProjectData {
  version: string
  imageBuffer?: Uint8Array
  settings: {
    projectName?: string
    processingOptions?: ImageProcessorOptions
    activeProfile?: ICCProfile | null
    analysis?: ColorAnalysis | null
    aiAdvice?: AIColorAdvice | null
    lastViewMode?: 'import' | 'analyze' | 'preview'
    exportFormat?: 'png' | 'jpeg' | 'tiff'
    exportSource?: 'original' | 'preview'
    aiTargetUse?: AIColorAnalysisRequest['targetUse']
    softProofEnabled?: boolean
  }
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
