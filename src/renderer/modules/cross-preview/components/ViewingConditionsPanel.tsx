import { Card, Form, Select, Slider } from 'antd'
import { useDebounce } from '../../../hooks/useDebounce'
import { translate } from '../../../constants/i18n'
import { useLocaleStore } from '../../../store/locale'
import { useProjectStore } from '../../../store/project'

interface ViewingConditionsPanelProps {
  disabled?: boolean
}

export default function ViewingConditionsPanel({ disabled }: ViewingConditionsPanelProps) {
  const locale = useLocaleStore((state) => state.locale)
  const processingOptions = useProjectStore((state) => state.processingOptions)
  const updateProcessingOptions = useProjectStore((state) => state.updateProcessingOptions)

  const debouncedUpdateViewingDistance = useDebounce(
    (value: number) => updateProcessingOptions({ viewingDistance: value }),
    300
  )
  const debouncedUpdateResolution = useDebounce(
    (value: number) => updateProcessingOptions({ resolution: value }),
    300
  )

  return (
    <Card
      title={translate(locale, 'crossPreview.conditions.title')}
      size="small"
      style={{
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border-light)'
      }}
    >
      <Form layout="vertical" disabled={disabled} style={{ marginTop: 'var(--space-sm)' }}>
        <Form.Item label={translate(locale, 'crossPreview.conditions.lightSource')} style={{ marginBottom: 'var(--space-md)' }}>
          <Select
            value={processingOptions.lightSource}
            onChange={(value) => updateProcessingOptions({ lightSource: value })}
            options={[
              { label: translate(locale, 'crossPreview.conditions.lightSource.d50'), value: 'D50' },
              { label: translate(locale, 'crossPreview.conditions.lightSource.d65'), value: 'D65' },
              { label: translate(locale, 'crossPreview.conditions.lightSource.f'), value: 'F' }
            ]}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item label={translate(locale, 'crossPreview.conditions.paperType')} style={{ marginBottom: 'var(--space-md)' }}>
          <Select
            value={processingOptions.paperType}
            onChange={(value) => updateProcessingOptions({ paperType: value })}
            options={[
              { label: translate(locale, 'crossPreview.conditions.paper.coated'), value: 'coated' },
              { label: translate(locale, 'crossPreview.conditions.paper.uncoated'), value: 'uncoated' },
              { label: translate(locale, 'crossPreview.conditions.paper.newsprint'), value: 'newsprint' }
            ]}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label={translate(locale, 'crossPreview.conditions.viewingDistance', { value: processingOptions.viewingDistance })}
          style={{ marginBottom: 'var(--space-md)' }}
        >
          <Slider
            min={150}
            max={500}
            step={10}
            value={processingOptions.viewingDistance}
            onChange={debouncedUpdateViewingDistance}
            tooltip={{ formatter: (val) => `${val}mm` }}
          />
        </Form.Item>

        <Form.Item
          label={translate(locale, 'crossPreview.conditions.resolution', { value: processingOptions.resolution })}
          style={{ marginBottom: 0 }}
        >
          <Slider
            min={72}
            max={600}
            step={1}
            value={processingOptions.resolution}
            onChange={debouncedUpdateResolution}
            tooltip={{ formatter: (val) => `${val} DPI` }}
          />
        </Form.Item>
      </Form>
    </Card>
  )
}
