import { Slider } from 'antd'
import { useState, useRef } from 'react'
import { toRealImageData } from '../../../utils/image-utils'
import { useCanvasImage } from '../../../hooks/useCanvasImage'

interface OverlayViewProps {
  originalImageData?: ImageData
  printPreviewData?: ImageData
}

export default function OverlayView({ originalImageData, printPreviewData }: OverlayViewProps) {
  const [opacity, setOpacity] = useState(50)
  const originalCanvasRef = useRef<HTMLCanvasElement>(null)
  const printCanvasRef = useRef<HTMLCanvasElement>(null)

  // 绘制原始图像
  useCanvasImage(originalCanvasRef, originalImageData)

  // 绘制打印预览图像
  useCanvasImage(printCanvasRef, printPreviewData)

  const originalData = toRealImageData(originalImageData)
  if (!originalData) {
    return (
      <div style={{ padding: 'var(--space-lg)' }}>
        <div style={{
          textAlign: 'center',
          padding: 48,
          color: 'var(--color-text-tertiary)',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-lg)'
        }}>
          请先导入图像
        </div>
      </div>
    )
  }

  const ratio = originalData.width / originalData.height
  const containerHeight = 380
  const displayWidth = Math.min(containerHeight * ratio, 600)
  const displayHeight = displayWidth / ratio

  const printData = toRealImageData(printPreviewData)

  return (
    <div style={{ padding: 'var(--space-md)' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
        background: 'var(--color-bg)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-md)'
      }}>
        <div style={{ position: 'relative' }}>
          <canvas
            ref={originalCanvasRef}
            style={{
              width: displayWidth,
              height: displayHeight,
              objectFit: 'contain',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)'
            }}
          />

          {printData && (
            <canvas
              ref={printCanvasRef}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: displayWidth,
                height: displayHeight,
                objectFit: 'contain',
                opacity: opacity / 100,
                mixBlendMode: 'multiply'
              }}
            />
          )}
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-lg)', padding: '0 var(--space-sm)' }}>
        <Slider
          min={0}
          max={100}
          value={opacity}
          onChange={setOpacity}
          tooltip={{ formatter: (val) => `${val}%` }}
        />
        <div style={{
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          fontSize: 13,
          marginTop: 'var(--space-xs)'
        }}>
          印刷预览层透明度：{opacity}%
        </div>
      </div>
    </div>
  )
}
