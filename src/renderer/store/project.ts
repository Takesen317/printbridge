import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ImageProcessorOptions } from '../services/image-processor'
import type { ProjectData } from '../../shared/types/electron'

interface ProjectState {
  projectName: string
  originalImage: ImageData | null
  processedImage: ImageData | null
  processingOptions: ImageProcessorOptions

  setProjectName: (name: string) => void
  setOriginalImage: (image: ImageData) => void
  setProcessedImage: (image: ImageData) => void
  updateProcessingOptions: (options: Partial<ImageProcessorOptions>) => void
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

// Convert ImageData to PNG buffer for saving
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
      blob.arrayBuffer().then((buffer) => {
        resolve(new Uint8Array(buffer as ArrayBuffer))
      })
    }, 'image/png')
  })
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projectName: '未命名项目',
      originalImage: null,
      processedImage: null,
      processingOptions: defaultOptions,

      setProjectName: (name) => set({ projectName: name }),
      setOriginalImage: (image) => set({ originalImage: image }),
      setProcessedImage: (image) => set({ processedImage: image }),
      updateProcessingOptions: (options) => set((state) => ({
        processingOptions: { ...state.processingOptions, ...options }
      })),
      resetProject: () => set({
        projectName: '未命名项目',
        originalImage: null,
        processedImage: null,
        processingOptions: defaultOptions
      }),

      saveProjectToFile: async () => {
        try {
          const state = get()
          const imageBuffer = await imageDataToBuffer(state.processedImage || state.originalImage)
          const data: ProjectData = {
            version: '1.0.0',
            imageBuffer,
            settings: {
              projectName: state.projectName,
              processingOptions: state.processingOptions
            }
          }
          if (window.electronAPI?.saveProject) {
            return await window.electronAPI.saveProject(data)
          }
          return false
        } catch (err) {
          console.error('Failed to save project:', err)
          return false
        }
      },

      loadProjectFromFile: async () => {
        try {
          if (!window.electronAPI?.loadProject) return false
          const data = await window.electronAPI.loadProject()
          if (!data) return false

          // Restore project state from loaded data
          if (data.imageBuffer && data.imageBuffer.length > 0) {
            const blob = new Blob([data.imageBuffer as BlobPart], { type: 'image/png' })
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
            if (!ctx) return false
            ctx.drawImage(img, 0, 0)
            const imageData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight)

            const settings = data.settings as {
              projectName?: string
              processingOptions?: ImageProcessorOptions
            }

            set({
              projectName: settings.projectName || '已加载项目',
              originalImage: imageData,
              processedImage: imageData,
              processingOptions: settings.processingOptions || defaultOptions
            })
            return true
          }
          return false
        } catch (err) {
          console.error('Failed to load project:', err)
          return false
        }
      }
    }),
    {
      name: 'printbridge-project',
      // ImageData 不能序列化，只保存项目名称和处理选项
      partialize: (state) => ({
        projectName: state.projectName,
        processingOptions: state.processingOptions
      })
    }
  )
)
