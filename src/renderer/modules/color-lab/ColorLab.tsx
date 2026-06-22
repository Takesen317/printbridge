import { UploadOutlined } from '@ant-design/icons'
import { Button, Card, Segmented, message } from 'antd'
import * as utif from 'utif'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { MenuAction } from '../../../shared/constants/menu'
import { ImageSkeleton } from '../../components/Skeleton'
import { translate } from '../../constants/i18n'
import { analyzeColor, getAvailableProfiles, initializeColorEngine } from '../../services/color-engine'
import type { ProjectViewMode } from '../../services/project-serializer'
import { useColorStore } from '../../store/color'
import { useLocaleStore } from '../../store/locale'
import { useProjectStore } from '../../store/project'
import { toRealImageData } from '../../utils/image-utils'
import { validateImageDimensions } from '../../utils/image-utils'
import ColorAnalyzer from './components/ColorAnalyzer'
import ColorLabHeader from './components/ColorLabHeader'
import ColorLabMainPreview from './components/ColorLabMainPreview'
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

  const { locale, setLocale } = useLocaleStore()
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
  const drawableImage = toRealImageData(effectiveImage)
  const viewMode: ProjectViewMode = lastViewMode

  const loadImageFromBuffer = useCallback((buffer: ArrayBuffer, filePath?: string) => {
    setIsLoading(true)
    const blob = new Blob([buffer], { type: detectMimeType(filePath) })
    const img = new Image()

    img.onload = () => {
      const validation = validateImageDimensions(img.naturalWidth, img.naturalHeight)
      if (!validation.valid) {
        message.error(translate(locale, 'message.invalidImageDimensions', { reason: validation.reason ?? 'unknown' }))
        if (validation.suggestedScale && validation.suggestedScale < 1) {
          message.warning(translate(locale, 'message.suggestedScale', { scale: Math.round(validation.suggestedScale * 100) }))
        }
        setIsLoading(false)
        return
      }

      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = img.naturalWidth
      tempCanvas.height = img.naturalHeight
      const ctx = tempCanvas.getContext('2d')
      if (!ctx) {
        message.error(translate(locale, 'message.imageContextUnavailable'))
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
      message.success(translate(locale, 'message.imageImported'))
    }

    img.onerror = () => {
      message.error(translate(locale, 'message.imageLoadFailed'))
      setIsLoading(false)
    }

    img.src = URL.createObjectURL(blob)
  }, [locale, setLastViewMode, setOriginalImage, setProcessedImage])

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
      message.warning(translate(locale, 'message.importBeforeExport'))
      return
    }

    if (exportFormat === 'tiff') {
      const rgba = new Uint8Array(sourceImage.data.buffer)
      const tiffBuffer = utif.encodeImage(rgba, sourceImage.width, sourceImage.height)

      if (window.electronAPI?.saveFile) {
        window.electronAPI.saveFile(new Uint8Array(tiffBuffer), { extension: 'tiff' }).then((success) => {
          message[success ? 'success' : 'error'](success ? translate(locale, 'message.tiffExportCompleted') : translate(locale, 'message.exportFailed'))
        })
      } else {
        const blob = new Blob([tiffBuffer], { type: 'image/tiff' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `printbridge-export-${Date.now()}.tiff`
        anchor.click()
        URL.revokeObjectURL(url)
        message.success(translate(locale, 'message.tiffExported'))
      }
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = sourceImage.width
    canvas.height = sourceImage.height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      message.error(translate(locale, 'message.exportCanvasUnavailable'))
      return
    }

    ctx.putImageData(sourceImage, 0, 0)
    const mimeType = exportFormat === 'jpeg' ? 'image/jpeg' : 'image/png'
    canvas.toBlob((blob) => {
      if (!blob) {
        message.error(translate(locale, 'message.exportFailed'))
        return
      }

      if (window.electronAPI?.saveFile) {
        blob.arrayBuffer().then((buffer) => {
          window.electronAPI?.saveFile(new Uint8Array(buffer), { extension: exportFormat }).then((success) => {
            message[success ? 'success' : 'error'](success ? translate(locale, 'message.imageExportCompleted') : translate(locale, 'message.exportFailed'))
          })
        })
      } else {
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `printbridge-export-${Date.now()}.${exportFormat}`
        anchor.click()
        URL.revokeObjectURL(url)
        message.success(translate(locale, 'message.imageExported'))
      }
    }, mimeType)
  }, [effectiveImage, exportFormat, exportSource, locale, processedImage])

  const handleAnalyze = useCallback(() => {
    const profile = activeProfile || profiles[0]
    if (!effectiveImage || !profile) {
      message.warning(translate(locale, 'message.importAndChooseProfile'))
      return
    }

    if (!activeProfile) {
      setActiveProfile(profile)
    }

    setAnalysis(analyzeColor(effectiveImage, profile))
    setLastViewMode('analyze')
  }, [activeProfile, effectiveImage, locale, profiles, setActiveProfile, setAnalysis, setLastViewMode])

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
        message[success ? 'success' : 'error'](success ? translate(locale, 'message.projectSaved') : translate(locale, 'message.projectSaveFailed'))
      } else if (action === 'load-project') {
        const success = await loadProjectFromFile()
        if (success) {
          setImageData(useProjectStore.getState().originalImage)
          message.success(translate(locale, 'message.projectLoaded'))
        } else {
          message.error(translate(locale, 'message.projectLoadFailed'))
        }
      }
    }

    window.addEventListener('printbridge:menu-action', handleMenuAction as EventListener)
    return () => window.removeEventListener('printbridge:menu-action', handleMenuAction as EventListener)
  }, [handleExport, handleOpenFile, loadProjectFromFile, locale, saveProjectToFile])

  const handleOpenProject = useCallback(() => {
    return loadProjectFromFile().then((success) => {
      if (success) {
        setImageData(useProjectStore.getState().originalImage)
        message.success(translate(locale, 'message.projectLoaded'))
      } else {
        message.error(translate(locale, 'message.projectLoadFailed'))
      }
    })
  }, [loadProjectFromFile, locale])

  const handleSaveProject = useCallback(() => {
    return saveProjectToFile().then((success) =>
      message[success ? 'success' : 'error'](success ? translate(locale, 'message.projectSaved') : translate(locale, 'message.projectSaveFailed'))
    )
  }, [locale, saveProjectToFile])

  return (
    <div className="module-content">
      <ColorLabHeader />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Segmented
          value={locale}
          onChange={(value) => setLocale(value as 'zh-CN' | 'en-US')}
          options={[
            { label: translate(locale, 'layout.language.zh'), value: 'zh-CN' },
            { label: translate(locale, 'layout.language.en'), value: 'en-US' }
          ]}
        />
      </div>
      <ColorLabNavigationToolbar onViewModeChange={setLastViewMode} viewMode={viewMode} />

      <Card
        style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border-light)' }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: 32, textAlign: 'center', background: drawableImage ? 'transparent' : 'var(--color-bg)', borderRadius: 'var(--radius-lg)' }}>
          {isLoading ? (
            <ImageSkeleton height={300} />
          ) : drawableImage ? (
            <ColorLabMainPreview imageData={drawableImage}>
              <ColorLabOverlayToolbar
                exportFormat={exportFormat}
                exportSource={exportSource}
                onExport={handleExport}
                onExportFormatChange={setExportFormat}
                onExportSourceChange={setExportSource}
                onReplace={handleOpenFile}
              />
            </ColorLabMainPreview>
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
              <h3 style={{ margin: '0 0 8px', color: 'var(--color-text-primary)' }}>{translate(locale, 'colorLab.importCardTitle')}</h3>
              <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 20px' }}>{translate(locale, 'colorLab.importCardDescription')}</p>
              <Button type="primary" size="large" icon={<UploadOutlined />} onClick={handleOpenFile} style={{ borderRadius: 'var(--radius-md)', height: 44, paddingLeft: 24, paddingRight: 24 }}>
                {translate(locale, 'colorLab.chooseFile')}
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

      {drawableImage && (
        <Card title={translate(locale, 'colorLab.project.config')} style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginTop: 16 }}>
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
        <Card title={translate(locale, 'colorLab.analysisResult')} style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginTop: 16 }}>
          <ColorAnalyzer />
        </Card>
      )}

      {(viewMode === 'preview' || (viewMode === 'import' && drawableImage)) && (
        <Card title={translate(locale, 'colorLab.softProofCard')} style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginTop: 16 }}>
          <SoftProofPreview originalImageData={drawableImage || undefined} proofImageData={drawableImage || undefined} />
        </Card>
      )}
    </div>
  )
}
