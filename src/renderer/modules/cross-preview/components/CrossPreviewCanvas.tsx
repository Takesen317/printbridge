import { ReloadOutlined } from '@ant-design/icons'
import { Button, Card, Tabs } from 'antd'
import OverlayView from './OverlayView'
import SideBySideView from './SideBySideView'

interface CrossPreviewCanvasProps {
  originalImageData?: ImageData
  printPreviewData?: ImageData
  onRefresh: () => void
  refreshDisabled: boolean
}

export default function CrossPreviewCanvas({
  originalImageData,
  printPreviewData,
  onRefresh,
  refreshDisabled
}: CrossPreviewCanvasProps) {
  return (
    <Card
      style={{
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--color-border-light)'
      }}
      styles={{ body: { padding: 0 } }}
    >
      <Tabs
        items={[
          {
            key: 'side-by-side',
            label: 'Side by side',
            children: <SideBySideView originalImageData={originalImageData} printPreviewData={printPreviewData} />
          },
          {
            key: 'overlay',
            label: 'Overlay',
            children: <OverlayView originalImageData={originalImageData} printPreviewData={printPreviewData} />
          }
        ]}
        style={{ padding: '0 16px' }}
      />
      <div style={{ padding: '16px' }}>
        <Button icon={<ReloadOutlined />} onClick={onRefresh} style={{ borderRadius: 'var(--radius-md)' }} disabled={refreshDisabled}>
          Refresh preview
        </Button>
      </div>
    </Card>
  )
}
