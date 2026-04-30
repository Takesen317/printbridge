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
  onMenuAction: (callback: (action: string) => void) => () => void
}

export interface ProcessOptions {
  colorMode?: 'rgb' | 'cmyk'
  resolution?: number
  addBleed?: boolean
}

export interface ProjectData {
  version: string
  imageBuffer?: Uint8Array
  settings: Record<string, unknown>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
