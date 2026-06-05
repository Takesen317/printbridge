import { Card, Switch, Typography } from 'antd'
import { useRef } from 'react'
import { useCanvasImage } from '../../../hooks/useCanvasImage'
import { useColorStore } from '../../../store/color'

const { Text } = Typography

interface SoftProofPreviewProps {
  originalImageData?: ImageData
  proofImageData?: ImageData
}

export default function SoftProofPreview({ originalImageData, proofImageData }: SoftProofPreviewProps) {
  const softProofEnabled = useColorStore((state) => state.softProofEnabled)
  const toggleSoftProof = useColorStore((state) => state.toggleSoftProof)
  const originalCanvasRef = useRef<HTMLCanvasElement>(null)
  const proofCanvasRef = useRef<HTMLCanvasElement>(null)

  useCanvasImage(originalCanvasRef, originalImageData, { useInstanceCheck: true })
  useCanvasImage(proofCanvasRef, proofImageData, { useInstanceCheck: true })

  return (
    <Card
      title="Soft-proof preview"
      extra={<Switch checkedChildren="On" unCheckedChildren="Off" checked={softProofEnabled} onChange={toggleSoftProof} />}
    >
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <Text type="secondary">Screen version</Text>
          <div
            style={{
              width: '100%',
              height: 200,
              backgroundColor: '#f0f0f0',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {originalImageData instanceof ImageData ? (
              <canvas ref={originalCanvasRef} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <Text type="secondary">Import an image to preview it here.</Text>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <Text type="secondary">Soft-proof version</Text>
          <div
            style={{
              width: '100%',
              height: 200,
              backgroundColor: '#f0f0f0',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              filter: softProofEnabled ? 'saturate(0.85) contrast(1.1)' : 'none'
            }}
          >
            {proofImageData instanceof ImageData ? (
              <canvas ref={proofCanvasRef} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <Text type="secondary">Enable soft proofing after importing an image.</Text>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
