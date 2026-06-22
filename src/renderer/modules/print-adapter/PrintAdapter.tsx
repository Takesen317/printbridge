import { Button, Card, Col, InputNumber, message, Progress, Row, Segmented, Space, Statistic } from 'antd'
import { useState } from 'react'
import { checkPrintReadiness, type PrintCheckOptions, type PrintCheckResult } from '../../services/print-checker'
import { useProjectStore } from '../../store/project'
import { applyFix, getFixDescription } from './fix-actions'
import ProblemList from './components/ProblemList'
import Wizard from './components/Wizard'

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
      message.warning('请先导入图像。')
      return
    }

    setChecking(true)

    const options: PrintCheckOptions = {
      minResolution: 300,
      requiredBleed: 3,
      paperSize,
      customWidthMm: paperSize === 'custom' ? customWidth : undefined,
      customHeightMm: paperSize === 'custom' ? customHeight : undefined
    }

    setTimeout(() => {
      setCheckResult(checkPrintReadiness(originalImage, options))
      setChecking(false)
    }, 300)
  }

  return (
    <div className="module-content">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, marginBottom: 8 }}>
          智能印前适配
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
          对分辨率、色域风险、色彩流程和出血问题进行启发式印前检查。
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card
          title="印前检查摘要"
          style={{
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--color-border-light)'
          }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="得分"
                value={checkResult?.overallScore || 0}
                suffix="/ 100"
                valueStyle={{ color: (checkResult?.overallScore || 0) >= 70 ? 'var(--color-success)' : 'var(--color-error)' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="错误"
                value={checkResult?.problems.filter((problem) => problem.severity === 'error').length || 0}
                valueStyle={{ color: 'var(--color-error)' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="警告"
                value={checkResult?.problems.filter((problem) => problem.severity === 'warning').length || 0}
                valueStyle={{ color: 'var(--color-warning)' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="启发式问题"
                value={checkResult?.heuristicWarnings || 0}
                valueStyle={{ color: 'var(--color-warning)' }}
              />
            </Col>
          </Row>

          <Progress
            percent={checkResult?.overallScore || 0}
            status={(checkResult?.overallScore || 0) >= 70 ? 'success' : 'exception'}
            strokeColor={checkResult?.overallScore && checkResult.overallScore >= 70 ? 'var(--color-success)' : 'var(--color-error)'}
            style={{ marginTop: 16 }}
          />

          <Space style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 90, color: 'var(--color-text-secondary)' }}>目标纸张：</span>
              <Segmented
                value={paperSize}
                onChange={(value) => setPaperSize(value as PaperSize)}
                options={[
                  { label: 'A4', value: 'A4' },
                  { label: 'A3', value: 'A3' },
                  { label: 'A5', value: 'A5' },
                  { label: '自定义', value: 'custom' }
                ]}
              />
            </div>

            {paperSize === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 90, color: 'var(--color-text-secondary)' }}>成品尺寸：</span>
                <InputNumber addonAfter="mm" value={customWidth} onChange={(value) => setCustomWidth(value || 210)} min={50} max={1000} style={{ width: 110 }} />
                <span>×</span>
                <InputNumber addonAfter="mm" value={customHeight} onChange={(value) => setCustomHeight(value || 297)} min={50} max={1000} style={{ width: 110 }} />
              </div>
            )}
          </Space>

          <Button type="primary" onClick={handleRunCheck} loading={checking} style={{ marginTop: 16, borderRadius: 'var(--radius-md)' }} disabled={!originalImage}>
            {checking ? '检查中...' : '开始检查'}
          </Button>
        </Card>

        <ProblemList
          problems={checkResult?.problems || []}
          onFixClick={(problem) => {
            const success = applyFix(problem)
            message[success ? 'success' : 'info'](getFixDescription(problem.type))
          }}
        />

        <Wizard onStepChange={() => undefined} onComplete={() => message.success('印前检查向导已完成。')} />
      </div>
    </div>
  )
}
