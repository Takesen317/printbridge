import { Card, Form, Select, Slider } from 'antd'
import { useProjectStore } from '../../../store/project'
import { useDebounce } from '../../../hooks/useDebounce'

interface ViewingConditionsPanelProps {
  disabled?: boolean
}

export default function ViewingConditionsPanel({ disabled }: ViewingConditionsPanelProps) {
  const processingOptions = useProjectStore((state) => state.processingOptions)
  const updateProcessingOptions = useProjectStore((state) => state.updateProcessingOptions)

  // Debounced update for slider changes to avoid excessive reprocessing
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
      title="观察条件模拟"
      size="small"
      style={{
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border-light)',
      }}
    >
      <Form
        layout="vertical"
        disabled={disabled}
        style={{ marginTop: 'var(--space-sm)' }}
      >
        <Form.Item
          label="光源"
          style={{ marginBottom: 'var(--space-md)' }}
        >
          <Select
            value={processingOptions.lightSource}
            onChange={(value) => updateProcessingOptions({ lightSource: value })}
            options={[
              { label: 'D50 (日光)', value: 'D50' },
              { label: 'D65 (标准日光)', value: 'D65' },
              { label: 'F (荧光灯)', value: 'F' }
            ]}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="纸张材质"
          style={{ marginBottom: 'var(--space-md)' }}
        >
          <Select
            value={processingOptions.paperType}
            onChange={(value) => updateProcessingOptions({ paperType: value })}
            options={[
              { label: '铜版纸 (Coated)', value: 'coated' },
              { label: '哑光纸 (Uncoated)', value: 'uncoated' },
              { label: '新闻纸 (Newsprint)', value: 'newsprint' }
            ]}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label={`观察距离：${processingOptions.viewingDistance}mm`}
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
          label={`分辨率：${processingOptions.resolution} DPI`}
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
