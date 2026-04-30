import { Card, Switch, Typography } from 'antd'
import { useState, useRef } from 'react'
import { useCanvasImage } from '../../../hooks/useCanvasImage'

const { Text } = Typography

interface SoftProofPreviewProps {
  originalImageData?: ImageData
  proofImageData?: ImageData
}

export default function SoftProofPreview({ originalImageData, proofImageData }: SoftProofPreviewProps) {
  const [softProofEnabled, setSoftProofEnabled] = useState(false)
  const originalCanvasRef = useRef<HTMLCanvasElement>(null)
  const proofCanvasRef = useRef<HTMLCanvasElement>(null)

  // 绘制原始图像
  useCanvasImage(originalCanvasRef, originalImageData, { useInstanceCheck: true })

  // 绘制打印预览图像
  useCanvasImage(proofCanvasRef, proofImageData, { useInstanceCheck: true })

  return (
    <Card
      title="软打样预览"
      extra={
        <Switch
          checkedChildren="开启"
          unCheckedChildren="关闭"
          checked={softProofEnabled}
          onChange={setSoftProofEnabled}
        />
      }
    >
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <Text type="secondary">数字显示</Text>
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
            {originalImageData instanceof ImageData
              ? <canvas
                  ref={originalCanvasRef}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              : <Text type="secondary">请导入图像</Text>
            }
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <Text type="secondary">模拟印刷效果</Text>
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
            {proofImageData instanceof ImageData
              ? <canvas
                  ref={proofCanvasRef}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              : <Text type="secondary">软打样关闭</Text>
            }
          </div>
        </div>
      </div>
    </Card>
  )
}
