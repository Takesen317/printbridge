import { UploadOutlined } from '@ant-design/icons'
import { Button, Card, message } from 'antd'
import * as utif from 'utif'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { MenuAction } from '../../../shared/constants/menu'
import { ImageSkeleton } from '../../components/Skeleton'
import { analyzeColor, getAvailableProfiles, initializeColorEngine } from '../../services/color-engine'
import type { ProjectViewMode } from '../../services/project-serializer'
import { useColorStore } from '../../store/color'
import { useProjectStore } from '../../store/project'
import { validateImageDimensions } from '../../utils/image-utils'
import ColorAnalyzer from './components/ColorAnalyzer'
import ColorLabHeader from './components/ColorLabHeader'
import {
  ColorLabNavigationToolbar,
  ColorLabOverlayToolbar,
  ColorLabProjectToolbar
} from './components/ColorLabToolbar'
import SoftProofPreview from './components/SoftProofPreview'

function detectMimeType(filePath?: string): string {
  const ext = filePath?.toLowerCase().split('.').pop()
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'bmp') return 'image/bmp'
  if (ext === 'tiff' || ext === 'tif') return 'image/tiff'
  return 'image/png'
}

export default function ColorLab() {
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { activeProfile, setActiveProfile, setAnalysis } = useColorStore()
  const {
    projectName,
    originalImage,
    processedImage,
    lastViewMode,
    exportFormat,
    exportSource,
    saveProjectToFile,
    loadProjectFromFile,
    setOriginalImage,
    setProcessedImage,
    setLastViewMode,
    setExportFormat,
    setExportSource
  } = useProjectStore()

  const profiles = getAvailableProfiles()
  const effectiveImage = imageData || originalImage
  const viewMode: ProjectViewMode = lastViewMode

  const loadImageFromBuffer = useCallback((buffer: ArrayBuffer, filePath?: string) => {
    setIsLoading(true)
    const blob = new Blob([buffer], { type: detectMimeType(filePath) })
    const img = new Image()

    img.onload = () => {
      const validation = validateImageDimensions(img.naturalWidth, img.naturalHeight)
      if (!validation.valid) {
        message.error(`Invalid image dimensions: ${validation.reason}`)
        if (validation.suggestedScale && validation.suggestedScale < 1) {
          message.warning(`Suggested scale: ${Math.round(validation.suggestedScale * 100)}% or smaller.`)
        }
        setIsLoading(false)
        return
      }

      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = img.naturalWidth
      tempCanvas.height = img.naturalHeight
      const ctx = tempCanvas.getContext('2d')
      if (!ctx) {
        message.error('Unable to create an image processing context.')
        setIsLoading(false)
        return
      }

      ctx.drawImage(img, 0, 0)
      const nextImage = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight)
      setImageData(nextImage)
      setOriginalImage(nextImage)
      setProcessedImage(nextImage)
      setLastViewMode('import')
      setIsLoading(false)
      message.success('Image imported.')
    }

    img.onerror = () => {
      message.error('Failed to load the image.')
      setIsLoading(false)
    }

    img.src = URL.createObjectURL(blob)
  }, [setLastViewMode, setOriginalImage, setProcessedImage])

  const handleOpenFile = useCallback(async () => {
    if (window.electronAPI?.openFile) {
      try {
        const result = await window.electronAPI.openFile()
        if (result) {
          loadImageFromBuffer(result.buffer.buffer as ArrayBuffer, result.filePath)
        }
        return
      } catch (err) {
        console.error('IPC openFile error:', err)
      }
    }

    inputRef.current?.click()
  }, [loadImageFromBuffer])

  const handleExport = useCallback(() => {
    const sourceImage = exportSource === 'preview' && processedImage ? processedImage : effectiveImage
    if (!sourceImage) {
      message.warning('Import an image before exporting.')
      return
    }

    if (exportFormat === 'tiff') {
      const rgba = new Uint8Array(sourceImage.data.buffer)
      const tiffBuffer = utif.encodeImage(rgba, sourceImage.width, sourceImage.height)

      if (window.electronAPI?.saveFile) {
        window.electronAPI.saveFile(new Uint8Array(tiffBuffer), { extension: 'tiff' }).then((success) => {
          message[success ? 'success' : 'error'](success ? 'TIFF export completed.' : 'Export failed.')
        })
      } else {
        const blob = new Blob([tiffBuffer], { type: 'image/tiff' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `printbridge-export-${Date.now()}.tiff`
        anchor.click()
        URL.revokeObjectURL(url)
        message.success('TIFF exported.')
      }
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = sourceImage.width
    canvas.height = sourceImage.height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      message.error('Unable to create an export canvas.')
      return
    }

    ctx.putImageData(sourceImage, 0, 0)
    const mimeType = exportFormat === 'jpeg' ? 'image/jpeg' : 'image/png'
    canvas.toBlob((blob) => {
      if (!blob) {
        message.error('Export failed.')
        return
      }

      if (window.electronAPI?.saveFile) {
        blob.arrayBuffer().then((buffer) => {
          window.electronAPI?.saveFile(new Uint8Array(buffer), { extension: exportFormat }).then((success) => {
            message[success ? 'success' : 'error'](success ? 'Image export completed.' : 'Export failed.')
          })
        })
      } else {
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `printbridge-export-${Date.now()}.${exportFormat}`
        anchor.click()
        URL.revokeObjectURL(url)
        message.success('Image exported.')
      }
    }, mimeType)
  }, [effectiveImage, exportFormat, exportSource, processedImage])

  const handleAnalyze = useCallback(() => {
    const profile = activeProfile || profiles[0]
    if (!effectiveImage || !profile) {
      message.warning('Import an image and choose a profile first.')
      return
    }

    if (!activeProfile) {
      setActiveProfile(profile)
    }

    setAnalysis(analyzeColor(effectiveImage, profile))
    setLastViewMode('analyze')
  }, [activeProfile, effectiveImage, profiles, setActiveProfile, setAnalysis, setLastViewMode])

  useEffect(() => {
    if (!canvasRef.current || !(effectiveImage instanceof ImageData)) return
    canvasRef.current.width = effectiveImage.width
    canvasRef.current.height = effectiveImage.height
    const ctx = canvasRef.current.getContext('2d')
    if (ctx) {
      ctx.putImageData(effectiveImage, 0, 0)
    }
  }, [effectiveImage])

  useEffect(() => {
    initializeColorEngine().then((result) => {
      if (!result.success && result.message) {
        message.warning(result.message)
      }
    })
  }, [])

  useEffect(() => {
    const handleMenuAction = async (event: Event) => {
      const action = (event as CustomEvent<MenuAction>).detail
      if (action === 'import-image') {
        await handleOpenFile()
      } else if (action === 'export-image') {
        handleExport()
      } else if (action === 'save-project') {
        const success = await saveProjectToFile()
        message[success ? 'success' : 'error'](success ? 'Project saved.' : 'Failed to save project.')
      } else if (action === 'load-project') {
        const success = await loadProjectFromFile()
        if (success) {
          setImageData(useProjectStore.getState().originalImage)
          message.success('Project loaded.')
        } else {
          message.error('Failed to load project.')
        }
      }
    }

    window.addEventListener('printbridge:menu-action', handleMenuAction as EventListener)
    return () => window.removeEventListener('printbridge:menu-action', handleMenuAction as EventListener)
  }, [handleExport, handleOpenFile, loadProjectFromFile, saveProjectToFile])

  const handleOpenProject = useCallback(() => {
    return loadProjectFromFile().then((success) => {
      if (success) {
        setImageData(useProjectStore.getState().originalImage)
        message.success('Project loaded.')
      } else {
        message.error('Failed to load project.')
      }
    })
  }, [loadProjectFromFile])

  const handleSaveProject = useCallback(() => {
    return saveProjectToFile().then((success) => message[success ? 'success' : 'error'](success ? 'Project saved.' : 'Failed to save project.'))
  }, [saveProjectToFile])

  return (
    <div className="module-content">
      <ColorLabHeader />
      <ColorLabNavigationToolbar onViewModeChange={setLastViewMode} viewMode={viewMode} />

      <Card
        style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border-light)' }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: 32, textAlign: 'center', background: effectiveImage ? 'transparent' : 'var(--color-bg)', borderRadius: 'var(--radius-lg)' }}>
          {isLoading ? (
            <ImageSkeleton height={300} />
          ) : effectiveImage ? (
            <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%', maxHeight: 400, objectFit: 'contain' }} />
              <ColorLabOverlayToolbar
                exportFormat={exportFormat}
                exportSource={exportSource}
                onExport={handleExport}
                onExportFormatChange={setExportFormat}
                onExportSourceChange={setExportSource}
                onReplace={handleOpenFile}
              />
            </div>
          ) : (
            <div>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'var(--color-primary-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <UploadOutlined style={{ fontSize: 32, color: 'var(--color-primary)' }} />
              </div>
              <h3 style={{ margin: '0 0 8px', color: 'var(--color-text-primary)' }}>Import image</h3>
              <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 20px' }}>Supports PNG, JPG, TIFF, and other common bitmap formats.</p>
              <Button type="primary" size="large" icon={<UploadOutlined />} onClick={handleOpenFile} style={{ borderRadius: 'var(--radius-md)', height: 44, paddingLeft: 24, paddingRight: 24 }}>
                Choose file
              </Button>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              file.arrayBuffer().then((buffer) => loadImageFromBuffer(buffer, file.name))
              event.target.value = ''
            }
          }}
        />
      </Card>

      {effectiveImage && (
        <Card title="Project and ICC configuration" style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginTop: 16 }}>
          <ColorLabProjectToolbar
            onAnalyze={handleAnalyze}
            onOpenProject={handleOpenProject}
            onSaveProject={handleSaveProject}
            onViewModeChange={setLastViewMode}
            profiles={profiles}
            projectName={projectName}
            viewMode={viewMode}
          />
        </Card>
      )}

      {viewMode === 'analyze' && (
        <Card title="Analysis result" style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginTop: 16 }}>
          <ColorAnalyzer />
        </Card>
      )}

      {(viewMode === 'preview' || (viewMode === 'import' && effectiveImage)) && (
        <Card title="Soft-proof preview" style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginTop: 16 }}>
          <SoftProofPreview originalImageData={effectiveImage || undefined} proofImageData={effectiveImage || undefined} />
        </Card>
      )}
    </div>
  )
}
