import { useRef } from 'react'
import { useCanvasImage } from '../../../hooks/useCanvasImage'

interface ColorLabMainPreviewProps {
  imageData: ImageData
  children?: React.ReactNode
}

export default function ColorLabMainPreview({ imageData, children }: ColorLabMainPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useCanvasImage(canvasRef, imageData)

  return (
    <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
      <div
        style={{
          minHeight: 360,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, rgba(248,250,252,0.85), rgba(255,255,255,1))',
          padding: 16
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '100%',
            maxHeight: 520,
            height: 'auto',
            objectFit: 'contain',
            borderRadius: 'var(--radius-sm)'
          }}
        />
      </div>
      {children}
    </div>
  )
}
