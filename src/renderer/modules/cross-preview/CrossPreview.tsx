import { Tabs, Button, message, Card } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useEffect, useMemo } from 'react'
import { useProjectStore } from '../../store/project'
import SideBySideView from './components/SideBySideView'
import OverlayView from './components/OverlayView'
import ViewingConditionsPanel from './components/ViewingConditionsPanel'
import AiAssistant from '../ai-assistant/AiAssistant'
import { toRealImageData } from '../../utils/image-utils'
import { useImageProcessorWorker } from '../../hooks/useImageProcessorWorker'

export default function CrossPreview() {
  const originalImage = useProjectStore((state) => state.originalImage)
  const processedImage = useProjectStore((state) => state.processedImage)
  const processingOptions = useProjectStore((state) => state.processingOptions)
  const setProcessedImage = useProjectStore((state) => state.setProcessedImage)

  // Web Worker hook for off-main-thread image processing
  const { processImage } = useImageProcessorWorker()

  // 转换为真正的 ImageData
  const originalForChild = toRealImageData(originalImage)
  const processedForChild = toRealImageData(processedImage)

  // 使用 useMemo 创建稳定的 options 引用
  // 只有当 options 的实际值变化时才创建新对象
  const stableOptions = useMemo(() => processingOptions, [
    processingOptions.colorMode,
    processingOptions.resolution,
    processingOptions.paperType,
    processingOptions.simulateViewingConditions,
    processingOptions.viewingDistance,
    processingOptions.lightSource,
    processingOptions.bleedMm
  ])

  // 监听条件变化，重新生成预览
  // 使用 Web Worker 处理，避免阻塞 UI
  useEffect(() => {
    const original = toRealImageData(originalImage)
    if (original && stableOptions) {
      processImage(original, stableOptions)
        .then((preview) => setProcessedImage(preview))
        .catch((error) => {
          console.error('Preview generation failed:', error)
          setProcessedImage(original)
        })
    }
    // processImage 和 setProcessedImage 是稳定的回调，不需要放在依赖数组中
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalImage, stableOptions])

  const handleRefresh = () => {
    const original = toRealImageData(originalImage)
    if (original && processingOptions) {
      processImage(original, processingOptions)
        .then((preview) => {
          setProcessedImage(preview)
          message.success('预览已刷新')
        })
        .catch((error) => {
          console.error('Refresh failed:', error)
          message.error('预览刷新失败')
        })
    }
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
          跨媒介预览
        </h1>
        <p style={{
          fontSize: 14,
          color: 'var(--color-text-secondary)',
          margin: 0,
        }}>
          对比数字显示与模拟印刷效果，预览不同观看条件下的表现
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <Card
            style={{
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--color-border-light)',
            }}
            styles={{ body: { padding: 0 } }}
          >
            <Tabs
              items={[
                {
                  key: 'side-by-side',
                  label: '并排对比',
                  children: (
                    <SideBySideView
                      originalImageData={originalForChild || undefined}
                      printPreviewData={processedForChild || undefined}
                    />
                  )
                },
                {
                  key: 'overlay',
                  label: '叠加对比',
                  children: (
                    <OverlayView
                      originalImageData={originalForChild || undefined}
                      printPreviewData={processedForChild || undefined}
                    />
                  )
                }
              ]}
              style={{ padding: '0 16px' }}
            />
            <div style={{ padding: '16px 16px 16px' }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                style={{ borderRadius: 'var(--radius-md)' }}
                disabled={!originalForChild}
              >
                刷新预览
              </Button>
            </div>
          </Card>
        </div>

        <div style={{ width: 300 }}>
          <ViewingConditionsPanel />
          <div style={{ marginTop: 16 }}>
            <AiAssistant />
          </div>
        </div>
      </div>
    </div>
  )
}
