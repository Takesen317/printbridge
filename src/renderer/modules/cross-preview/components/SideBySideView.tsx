import { Slider } from 'antd'
import { useState, useRef } from 'react'
import { toRealImageData } from '../../../utils/image-utils'
import { useCanvasImage } from '../../../hooks/useCanvasImage'

interface SideBySideViewProps {
  originalImageData?: ImageData
  printPreviewData?: ImageData
}

export default function SideBySideView({ originalImageData, printPreviewData }: SideBySideViewProps) {
  const [dividerPosition, setDividerPosition] = useState(50)
  const originalCanvasRef = useRef<HTMLCanvasElement>(null)
  const printCanvasRef = useRef<HTMLCanvasElement>(null)

  // 绘制原始图像
  useCanvasImage(originalCanvasRef, originalImageData)

  // 绘制打印预览图像
  useCanvasImage(printCanvasRef, printPreviewData)

  const renderCanvas = (imageData: unknown, canvasRef: React.RefObject<HTMLCanvasElement>, containerHeight: number, label: string) => {
    const imgData = toRealImageData(imageData)
    if (!imgData) {
      return (
        <div style={{
          width: '100%',
          height: containerHeight,
          backgroundColor: 'var(--color-border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text-secondary)'
        }}>
          无图像 - {label}
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
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          background: 'rgba(15, 23, 42, 0.75)',
          color: 'white',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 12,
          fontWeight: 500
        }}>
          {label}
        </div>
      </div>
    )
  }

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
        <div style={{ display: 'flex', maxWidth: '100%' }}>
          <div style={{ width: `${dividerPosition}%`, overflow: 'hidden' }}>
            {renderCanvas(originalImageData, originalCanvasRef, 380, '数字显示')}
          </div>
          <div style={{
            width: 4,
            background: 'var(--color-primary)',
            cursor: 'col-resize',
            borderRadius: 2
          }} />
          <div style={{ width: `${100 - dividerPosition}%`, overflow: 'hidden' }}>
            {renderCanvas(printPreviewData, printCanvasRef, 380, '模拟印刷')}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-lg)', padding: '0 var(--space-sm)' }}>
        <Slider
          min={10}
          max={90}
          value={dividerPosition}
          onChange={setDividerPosition}
          tooltip={{ formatter: (val) => `${val}%` }}
        />
        <div style={{
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          fontSize: 13,
          marginTop: 'var(--space-xs)'
        }}>
          拖动分隔线调整对比比例：{dividerPosition}%
        </div>
      </div>
    </div>
  )
}
