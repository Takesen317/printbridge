import { Card, Button, message, Segmented, Select } from 'antd'
import { UploadOutlined, CameraOutlined, ExperimentOutlined, DownloadOutlined } from '@ant-design/icons'
import { useState, useRef, useEffect } from 'react'
import { useColorStore } from '../../store/color'
import { useProjectStore } from '../../store/project'
import { getAvailableProfiles, analyzeColor, initializeColorEngine } from '../../services/color-engine'
import { ImageSkeleton } from '../../components/Skeleton'
import ProfileSelector from './components/ProfileSelector'
import ColorAnalyzer from './components/ColorAnalyzer'
import SoftProofPreview from './components/SoftProofPreview'
import { validateImageDimensions } from '../../utils/image-utils'
import * as utif from 'utif'

type ViewMode = 'import' | 'analyze' | 'preview'
type ExportFormat = 'png' | 'jpeg' | 'tiff'
type ExportSource = 'original' | 'preview'

export default function ColorLab() {
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('import')
  const [isLoading, setIsLoading] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png')
  const [exportSource, setExportSource] = useState<ExportSource>('original')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { activeProfile, setActiveProfile, setAnalysis } = useColorStore()
  const { originalImage, processedImage, setOriginalImage, setProcessedImage } = useProjectStore()

  const profiles = getAvailableProfiles()

  // 当 imageData 变化时重绘 canvas（所有绘制逻辑集中在这里）
  useEffect(() => {
    if (canvasRef.current && imageData instanceof ImageData) {
      canvasRef.current.width = imageData.width
      canvasRef.current.height = imageData.height
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.putImageData(imageData, 0, 0)
      }
    }
  }, [imageData])

  // 从全局 store 恢复图像（组件重新挂载时）
  useEffect(() => {
    if (originalImage && !imageData) {
      setImageData(originalImage)
    }
  }, [originalImage])

  // 初始化 ICC 引擎
  useEffect(() => {
    initializeColorEngine()
  }, [])

  const handleOpenFile = async () => {
    // 优先使用 IPC (Electron 环境)
    if (window.electronAPI?.openFile) {
      try {
        const result = await window.electronAPI.openFile()
        if (result) {
          loadImageFromBuffer(result.buffer.buffer as ArrayBuffer, result.filePath)
        }
        // 用户取消选择时什么都不做，不弹后备对话框
      } catch (err) {
        console.error('IPC openFile error:', err)
        // 仅在出错时使用后备方案
        document.getElementById('file-input')?.click()
      }
    } else {
      // 后备方案: HTML5 File API (浏览器环境)
      document.getElementById('file-input')?.click()
    }
  }

  // 从 ArrayBuffer 加载图像（由 IPC 调用）
  const loadImageFromBuffer = (buffer: ArrayBuffer, filePath?: string) => {
    setIsLoading(true)
    // 根据文件扩展名推断 MIME 类型
    let mimeType = 'image/png'
    if (filePath) {
      const ext = filePath.toLowerCase().split('.').pop()
      if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg'
      else if (ext === 'bmp') mimeType = 'image/bmp'
      else if (ext === 'tiff' || ext === 'tif') mimeType = 'image/tiff'
    }

    const blob = new Blob([buffer], { type: mimeType })
    const img = new Image()
    img.onload = () => {
      const width = img.naturalWidth
      const height = img.naturalHeight

      // Validate image dimensions before processing
      const validation = validateImageDimensions(width, height)
      if (!validation.valid) {
        message.error(`图像尺寸无效: ${validation.reason}`)
        if (validation.suggestedScale && validation.suggestedScale < 1) {
          message.warning(`建议: 将图像缩小到 ${Math.round(1 / validation.suggestedScale)}% 以下`)
        }
        setIsLoading(false)
        return
      }

      // 创建临时 canvas 来获取 ImageData
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = width
      tempCanvas.height = height
      const ctx = tempCanvas.getContext('2d')
      if (!ctx) {
        message.error('无法创建图像处理上下文')
        setIsLoading(false)
        return
      }
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, width, height)
      if (data) {
        setImageData(data)
        setOriginalImage(data)
        setProcessedImage(data)
        message.success('图像导入成功')
      } else {
        message.error('无法获取图像数据')
      }
      setIsLoading(false)
    }
    img.onerror = () => {
      message.error('图像加载失败')
      setIsLoading(false)
    }
    img.src = URL.createObjectURL(blob)
  }

  // 从 File 对象加载图像（由 HTML5 File API 调用）
  const handleFileImport = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      message.error('请选择有效的图像文件')
      return
    }
    setIsLoading(true)
    const img = new Image()
    img.onload = () => {
      const width = img.naturalWidth
      const height = img.naturalHeight

      // Validate image dimensions before processing
      const validation = validateImageDimensions(width, height)
      if (!validation.valid) {
        message.error(`图像尺寸无效: ${validation.reason}`)
        if (validation.suggestedScale && validation.suggestedScale < 1) {
          message.warning(`建议: 将图像缩小到 ${Math.round(1 / validation.suggestedScale)}% 以下`)
        }
        setIsLoading(false)
        return
      }

      // 创建临时 canvas 来获取 ImageData
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = width
      tempCanvas.height = height
      const ctx = tempCanvas.getContext('2d')
      if (!ctx) {
        message.error('无法创建图像处理上下文')
        setIsLoading(false)
        return
      }
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, width, height)
      if (data) {
        setImageData(data)
        setOriginalImage(data)
        setProcessedImage(data)
        message.success('图像导入成功')
      } else {
        message.error('无法获取图像数据')
      }
      setIsLoading(false)
    }
    img.onerror = () => {
      message.error('图像加载失败，请确保文件是有效的图像格式')
      setIsLoading(false)
    }
    img.src = URL.createObjectURL(file)
  }

  const handleAnalyze = () => {
    if (profiles.length > 0 && !activeProfile) {
      setActiveProfile(profiles[0])
    }
    if (imageData && activeProfile) {
      const analysis = analyzeColor(imageData, activeProfile)
      setAnalysis(analysis)
      setViewMode('analyze')
    }
  }

  const handleExport = () => {
    // 确定要导出的图像数据
    const sourceImage = exportSource === 'preview' && processedImage ? processedImage : imageData
    if (!sourceImage) {
      message.warning('请先导入图像')
      return
    }

    // TIFF 导出使用 utif 库
    if (exportFormat === 'tiff') {
      // ImageData.data is Uint8ClampedArray, convert to Uint8Array
      const rgba = new Uint8Array(sourceImage.data.buffer)
      const tiffBuffer = utif.encodeImage(rgba, sourceImage.width, sourceImage.height)

      if (window.electronAPI?.saveFile) {
        window.electronAPI.saveFile(new Uint8Array(tiffBuffer), { extension: 'tiff' }).then((success) => {
          if (success) {
            message.success('TIFF 导出成功')
          } else {
            message.error('导出失败')
          }
        })
      } else {
        // 浏览器环境：直接下载
        const blob = new Blob([tiffBuffer], { type: 'image/tiff' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `printbridge-export-${Date.now()}.tiff`
        a.click()
        URL.revokeObjectURL(url)
        message.success('TIFF 已导出')
      }
      return
    }

    // PNG/JPEG 导出使用 canvas
    const canvas = document.createElement('canvas')
    canvas.width = sourceImage.width
    canvas.height = sourceImage.height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      message.error('无法创建图像上下文')
      return
    }
    ctx.putImageData(sourceImage, 0, 0)

    // 根据选择格式导出
    const mimeType = exportFormat === 'jpeg' ? 'image/jpeg' : 'image/png'
    const extension = exportFormat

    canvas.toBlob((blob) => {
      if (!blob) {
        message.error('导出失败')
        return
      }

      // 使用 Electron IPC 保存，或直接下载
      if (window.electronAPI?.saveFile) {
        blob.arrayBuffer().then((buffer) => {
          window.electronAPI!.saveFile(new Uint8Array(buffer), { extension }).then((success) => {
            if (success) {
              message.success('图像导出成功')
            } else {
              message.error('导出失败')
            }
          })
        })
      } else {
        // 浏览器环境：直接下载
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `printbridge-export-${Date.now()}.${extension}`
        a.click()
        URL.revokeObjectURL(url)
        message.success('图像已导出')
      }
    }, mimeType)
  }

  return (
    <div className="module-content">
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 24,
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: 0,
          marginBottom: 8,
        }}>
          色彩实验室
        </h1>
        <p style={{
          fontSize: 14,
          color: 'var(--color-text-secondary)',
          margin: 0,
        }}>
          导入图像，分析色彩范围，执行软打样预览
        </p>
      </div>

      {/* View Mode Switcher */}
      <div style={{ marginBottom: 20 }}>
        <Segmented
          value={viewMode}
          onChange={(val) => setViewMode(val as ViewMode)}
          options={[
            { label: '导入', value: 'import', icon: <UploadOutlined /> },
            { label: '分析', value: 'analyze', icon: <CameraOutlined /> },
            { label: '预览', value: 'preview', icon: <ExperimentOutlined /> },
          ]}
          block
        />
      </div>

      {/* Image Import Section - Always show the file input for import */}
      <Card
        style={{
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--color-border-light)',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{
          padding: 32,
          textAlign: 'center',
          background: imageData ? 'transparent' : 'var(--color-bg)',
          borderRadius: 'var(--radius-lg)',
        }}>
          {isLoading ? (
            <ImageSkeleton height={300} />
          ) : imageData ? (
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
            }}>
              <canvas
                ref={canvasRef}
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: 400,
                  objectFit: 'contain',
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                display: 'flex',
                gap: 8,
              }}>
                <Button
                  id="export-button"
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  style={{ borderRadius: 'var(--radius-md)' }}
                >
                  导出
                </Button>
                <Select
                  value={exportSource}
                  onChange={setExportSource}
                  style={{ width: 100 }}
                  options={[
                    { label: '原始', value: 'original' },
                    { label: '预览', value: 'preview' },
                  ]}
                />
                <Select
                  value={exportFormat}
                  onChange={setExportFormat}
                  style={{ width: 80 }}
                  options={[
                    { label: 'PNG', value: 'png' },
                    { label: 'JPEG', value: 'jpeg' },
                    { label: 'TIFF', value: 'tiff' },
                  ]}
                />
                <Button
                  icon={<UploadOutlined />}
                  onClick={handleOpenFile}
                  style={{ borderRadius: 'var(--radius-md)' }}
                >
                  更换图像
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'var(--color-primary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <UploadOutlined style={{ fontSize: 32, color: 'var(--color-primary)' }} />
              </div>
              <h3 style={{ margin: '0 0 8px', color: 'var(--color-text-primary)' }}>
                导入图像文件
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 20px' }}>
                支持 PNG、JPG、TIFF 等格式
              </p>
              <Button
                type="primary"
                size="large"
                icon={<UploadOutlined />}
                onClick={handleOpenFile}
                style={{
                  borderRadius: 'var(--radius-md)',
                  height: 44,
                  paddingLeft: 24,
                  paddingRight: 24,
                }}
              >
                选择文件
              </Button>
            </div>
          )}
        </div>
        {/* File input is always in DOM for direct access */}
        <input
          id="file-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileImport(file)
          }}
        />
      </Card>

      {/* Profile Selection */}
      {imageData && viewMode !== 'preview' && (
        <Card
          title="ICC 色彩配置"
          style={{
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            marginTop: 16,
          }}
        >
          <ProfileSelector profiles={profiles} />
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <Button
              type="primary"
              onClick={handleAnalyze}
              disabled={!imageData}
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              执行色彩分析
            </Button>
            {viewMode === 'analyze' && (
              <Button
                onClick={() => setViewMode('preview')}
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                查看软打样
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Color Analyzer */}
      {viewMode === 'analyze' && (
        <Card
          title="色彩分析结果"
          style={{
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            marginTop: 16,
          }}
        >
          <ColorAnalyzer />
        </Card>
      )}

      {/* Soft Proof Preview */}
      {(viewMode === 'preview' || (viewMode === 'import' && imageData)) && (
        <Card
          title="软打样预览"
          style={{
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            marginTop: 16,
          }}
        >
          <SoftProofPreview
            originalImageData={imageData || undefined}
            proofImageData={imageData || undefined}
          />
        </Card>
      )}
    </div>
  )
}
