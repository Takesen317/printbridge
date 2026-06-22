import { Button, Card, Space, Steps } from 'antd'
import { useState } from 'react'

interface WizardProps {
  onStepChange?: (step: number) => void
  onComplete?: () => void
}

export default function Wizard({ onStepChange, onComplete }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { title: '检查问题', description: '扫描设计稿' },
    { title: '修正问题', description: '应用修正建议' },
    { title: '预览效果', description: '确认输出效果' },
    { title: '导出文件', description: '生成印刷文件' }
  ]

  const handleNext = () => {
    const next = currentStep + 1
    setCurrentStep(next)
    onStepChange?.(next)
    if (next === steps.length) {
      onComplete?.()
    }
  }

  const handlePrev = () => {
    const prev = Math.max(0, currentStep - 1)
    setCurrentStep(prev)
    onStepChange?.(prev)
  }

  return (
    <Card
      title="修正工作流"
      style={{
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border-light)'
      }}
    >
      <Steps current={currentStep} items={steps} style={{ marginBottom: 'var(--space-lg)' }} />
      <div style={{ marginTop: 'var(--space-lg)' }}>
        <Space>
          <Button onClick={handlePrev} disabled={currentStep === 0} style={{ borderRadius: 'var(--radius-md)' }}>
            上一步
          </Button>
          <Button type="primary" onClick={handleNext} style={{ borderRadius: 'var(--radius-md)' }}>
            {currentStep === steps.length - 1 ? '完成' : '下一步'}
          </Button>
        </Space>
      </div>
    </Card>
  )
}
