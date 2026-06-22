import { Slider } from 'antd'
import { useRef, useState } from 'react'
import { useCanvasImage } from '../../../hooks/useCanvasImage'
import { translate } from '../../../constants/i18n'
import { useLocaleStore } from '../../../store/locale'
import { toRealImageData } from '../../../utils/image-utils'

interface SideBySideViewProps {
  originalImageData?: ImageData
  printPreviewData?: ImageData
}

export default function SideBySideView({ originalImageData, printPreviewData }: SideBySideViewProps) {
  const locale = useLocaleStore((state) => state.locale)
  const [dividerPosition, setDividerPosition] = useState(50)
  const originalCanvasRef = useRef<HTMLCanvasElement>(null)
  const printCanvasRef = useRef<HTMLCanvasElement>(null)

  useCanvasImage(originalCanvasRef, originalImageData)
  useCanvasImage(printCanvasRef, printPreviewData)

  const renderCanvas = (
    imageData: unknown,
    canvasRef: React.RefObject<HTMLCanvasElement>,
    containerHeight: number,
    label: string
  ) => {
    const imgData = toRealImageData(imageData)
    if (!imgData) {
      return (
        <div
          style={{
            width: '100%',
            height: containerHeight,
            backgroundColor: 'var(--color-border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-secondary)'
          }}
        >
          {translate(locale, 'crossPreview.emptyImage', { label })}
        </div>
      )
    }

    const ratio = imgData.width / imgData.height
    const displayWidth = Math.min(containerHeight * ratio, 400)
    const displayHeight = displayWidth / ratio

    return (
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{
            width: displayWidth,
            height: displayHeight,
            objectFit: 'contain',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            background: 'rgba(15, 23, 42, 0.75)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12,
            fontWeight: 500
          }}
        >
          {label}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--space-md)' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-md)'
        }}
      >
        <div style={{ display: 'flex', maxWidth: '100%' }}>
          <div style={{ width: `${dividerPosition}%`, overflow: 'hidden' }}>
            {renderCanvas(originalImageData, originalCanvasRef, 380, translate(locale, 'crossPreview.label.screen'))}
          </div>
          <div
            style={{
              width: 4,
              background: 'var(--color-primary)',
              cursor: 'col-resize',
              borderRadius: 2
            }}
          />
          <div style={{ width: `${100 - dividerPosition}%`, overflow: 'hidden' }}>
            {renderCanvas(printPreviewData, printCanvasRef, 380, translate(locale, 'crossPreview.label.print'))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-lg)', padding: '0 var(--space-sm)' }}>
        <Slider min={10} max={90} value={dividerPosition} onChange={setDividerPosition} tooltip={{ formatter: (val) => `${val}%` }} />
        <div
          style={{
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            fontSize: 13,
            marginTop: 'var(--space-xs)'
          }}
        >
          {translate(locale, 'crossPreview.divider', { value: dividerPosition })}
        </div>
      </div>
    </div>
  )
}
