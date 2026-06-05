import { message } from 'antd'
import { useEffect } from 'react'
import { useImageProcessorWorker } from '../../hooks/useImageProcessorWorker'
import { useProjectStore } from '../../store/project'
import { toRealImageData } from '../../utils/image-utils'
import AiAssistant from '../ai-assistant/AiAssistant'
import CrossPreviewCanvas from './components/CrossPreviewCanvas'
import CrossPreviewHeader from './components/CrossPreviewHeader'
import ViewingConditionsPanel from './components/ViewingConditionsPanel'

export default function CrossPreview() {
  const originalImage = useProjectStore((state) => state.originalImage)
  const processedImage = useProjectStore((state) => state.processedImage)
  const processingOptions = useProjectStore((state) => state.processingOptions)
  const setProcessedImage = useProjectStore((state) => state.setProcessedImage)
  const { processImage } = useImageProcessorWorker()

  const processedForChild = toRealImageData(processedImage)

  useEffect(() => {
    const sourceImage = toRealImageData(originalImage)
    if (!sourceImage) return

    processImage(sourceImage, processingOptions)
      .then((preview) => setProcessedImage(preview))
      .catch((error) => {
        console.error('Preview generation failed:', error)
        setProcessedImage(sourceImage)
      })
  }, [originalImage, processImage, processingOptions, setProcessedImage])

  const handleRefresh = () => {
    const sourceImage = toRealImageData(originalImage)
    if (!sourceImage) return

    processImage(sourceImage, processingOptions)
      .then((preview) => {
        setProcessedImage(preview)
        message.success('Preview refreshed.')
      })
      .catch((error) => {
        console.error('Refresh failed:', error)
        message.error('Failed to refresh preview.')
      })
  }

  return (
    <div className="module-content">
      <CrossPreviewHeader />

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <CrossPreviewCanvas
            originalImageData={toRealImageData(originalImage) || undefined}
            printPreviewData={processedForChild || undefined}
            onRefresh={handleRefresh}
            refreshDisabled={!toRealImageData(originalImage)}
          />
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
