import { ReloadOutlined } from '@ant-design/icons'
import { Button, Card, Spin, Tabs } from 'antd'
import { translate } from '../../../constants/i18n'
import { useLocaleStore } from '../../../store/locale'
import OverlayView from './OverlayView'
import SideBySideView from './SideBySideView'

interface CrossPreviewCanvasProps {
  originalImageData?: ImageData
  printPreviewData?: ImageData
  onRefresh: () => void
  refreshDisabled: boolean
  isProcessing?: boolean
}

export default function CrossPreviewCanvas({
  originalImageData,
  printPreviewData,
  onRefresh,
  refreshDisabled,
  isProcessing = false
}: CrossPreviewCanvasProps) {
  const locale = useLocaleStore((state) => state.locale)

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
            label: translate(locale, 'crossPreview.tabs.sideBySide'),
            children: <SideBySideView originalImageData={originalImageData} printPreviewData={printPreviewData} />
          },
          {
            key: 'overlay',
            label: translate(locale, 'crossPreview.tabs.overlay'),
            children: <OverlayView originalImageData={originalImageData} printPreviewData={printPreviewData} />
          }
        ]}
        style={{ padding: '0 16px' }}
      />
      <div style={{ padding: '16px' }}>
        <Button icon={<ReloadOutlined />} onClick={onRefresh} style={{ borderRadius: 'var(--radius-md)' }} disabled={refreshDisabled}>
          {translate(locale, 'crossPreview.refresh')}
        </Button>
        {isProcessing && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)' }}>
            <Spin size="small" />
            <span>{translate(locale, 'crossPreview.refreshing')}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
