import { Card, Progress, Row, Col, Statistic, Button, message, Segmented, InputNumber, Space } from 'antd'
import { useState } from 'react'
import { useProjectStore } from '../../store/project'
import { checkPrintReadiness, PrintCheckResult, PrintCheckOptions } from '../../services/print-checker'
import ProblemList from './components/ProblemList'
import Wizard from './components/Wizard'
import { applyFix, getFixDescription } from './fix-actions'

type PaperSize = 'A4' | 'A3' | 'A5' | 'custom'

export default function PrintAdapter() {
  const { originalImage } = useProjectStore()
  const [checkResult, setCheckResult] = useState<PrintCheckResult | null>(null)
  const [checking, setChecking] = useState(false)
  const [paperSize, setPaperSize] = useState<PaperSize>('A4')
  const [customWidth, setCustomWidth] = useState<number>(210)
  const [customHeight, setCustomHeight] = useState<number>(297)

  const handleRunCheck = () => {
    if (!originalImage) {
      message.warning('请先导入图像')
      return
    }

    setChecking(true)

    const options: PrintCheckOptions = {
      minResolution: 300,
      requiredBleed: 3,
      paperSize,
      customWidthMm: paperSize === 'custom' ? customWidth : undefined,
      customHeightMm: paperSize === 'custom' ? customHeight : undefined,
    }

    setTimeout(() => {
      const result = checkPrintReadiness(originalImage, options)
      setCheckResult(result)
      setChecking(false)
    }, 1000)
  }

  return (
    <div className="module-content">
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 24,
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: 0,
          marginBottom: 8,
        }}>
          智能印刷适配
        </h1>
        <p style={{
          fontSize: 14,
          color: 'var(--color-text-secondary)',
          margin: 0,
        }}>
          检测图像印刷准备度，识别潜在问题并提供修正建议
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card
          title="印刷准备度检测"
          style={{
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--color-border-light)',
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="总分"
                value={checkResult?.overallScore || 0}
                suffix="/ 100"
                valueStyle={{
                  color: (checkResult?.overallScore || 0) >= 70
                    ? 'var(--color-success)'
                    : 'var(--color-error)'
                }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="错误"
                value={checkResult?.problems.filter(p => p.severity === 'error').length || 0}
                valueStyle={{ color: 'var(--color-error)' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="警告"
                value={checkResult?.problems.filter(p => p.severity === 'warning').length || 0}
                valueStyle={{ color: 'var(--color-warning)' }}
              />
            </Col>
          </Row>

          <Progress
            percent={checkResult?.overallScore || 0}
            status={(checkResult?.overallScore || 0) >= 70 ? 'success' : 'exception'}
            strokeColor={checkResult?.overallScore && checkResult.overallScore >= 70
              ? 'var(--color-success)'
              : 'var(--color-error)'}
            style={{ marginTop: 16 }}
          />

          <Space style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 80, color: 'var(--color-text-secondary)' }}>目标纸张:</span>
              <Segmented
                value={paperSize}
                onChange={(val) => setPaperSize(val as PaperSize)}
                options={[
                  { label: 'A4', value: 'A4' },
                  { label: 'A3', value: 'A3' },
                  { label: 'A5', value: 'A5' },
                  { label: '自定义', value: 'custom' },
                ]}
              />
            </div>
            {paperSize === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 80, color: 'var(--color-text-secondary)' }}>自定义尺寸:</span>
                <InputNumber
                  addonAfter="mm"
                  value={customWidth}
                  onChange={(val) => setCustomWidth(val || 210)}
                  min={50}
                  max={1000}
                  style={{ width: 100 }}
                />
                <span>×</span>
                <InputNumber
                  addonAfter="mm"
                  value={customHeight}
                  onChange={(val) => setCustomHeight(val || 297)}
                  min={50}
                  max={1000}
                  style={{ width: 100 }}
                />
              </div>
            )}
          </Space>

          <Button
            type="primary"
            onClick={handleRunCheck}
            loading={checking}
            style={{ marginTop: 16, borderRadius: 'var(--radius-md)' }}
            disabled={!originalImage}
          >
            {checking ? '检测中...' : '运行印刷检测'}
          </Button>
        </Card>

        <ProblemList
          problems={checkResult?.problems || []}
          onFixClick={(problem) => {
            const success = applyFix(problem)
            if (success) {
              message.success(getFixDescription(problem.type))
            } else {
              message.info(getFixDescription(problem.type))
            }
          }}
        />

        <Wizard
          onStepChange={(step) => console.log('Step:', step)}
          onComplete={() => message.success('工作流完成')}
        />
      </div>
    </div>
  )
}