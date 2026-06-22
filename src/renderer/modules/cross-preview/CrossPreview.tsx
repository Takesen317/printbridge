import { message } from 'antd'
import { useEffect } from 'react'
import { translate } from '../../constants/i18n'
import { useImageProcessorWorker } from '../../hooks/useImageProcessorWorker'
import { useLocaleStore } from '../../store/locale'
import { useProjectStore } from '../../store/project'
import { toRealImageData } from '../../utils/image-utils'
import AiAssistant from '../ai-assistant/AiAssistant'
import CrossPreviewCanvas from './components/CrossPreviewCanvas'
import CrossPreviewHeader from './components/CrossPreviewHeader'
import ViewingConditionsPanel from './components/ViewingConditionsPanel'

export default function CrossPreview() {
  const locale = useLocaleStore((state) => state.locale)
  const originalImage = useProjectStore((state) => state.originalImage)
  const processedImage = useProjectStore((state) => state.processedImage)
  const processingOptions = useProjectStore((state) => state.processingOptions)
  const setProcessedImage = useProjectStore((state) => state.setProcessedImage)
  const { processImage, isProcessing } = useImageProcessorWorker()

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
        message.success(translate(locale, 'crossPreview.refreshSuccess'))
      })
      .catch((error) => {
        console.error('Refresh failed:', error)
        message.error(translate(locale, 'crossPreview.refreshError'))
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
            isProcessing={isProcessing}
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
