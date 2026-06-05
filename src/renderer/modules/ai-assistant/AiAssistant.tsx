import { CheckCircleOutlined, RobotOutlined, ThunderboltOutlined, WarningOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Divider, Select, Space, Spin, Tag, Typography } from 'antd'
import { analyzeImageWithAI } from '../../services/ai-color-advisor'
import { useProjectStore } from '../../store/project'
import { toRealImageData } from '../../utils/image-utils'
import { useState } from 'react'

const { Title, Text, Paragraph } = Typography

interface AiAssistantProps {
  className?: string
}

export default function AiAssistant({ className }: AiAssistantProps) {
  const originalImage = useProjectStore((state) => state.originalImage)
  const advice = useProjectStore((state) => state.aiAdvice)
  const targetUse = useProjectStore((state) => state.aiTargetUse)
  const setAiAdvice = useProjectStore((state) => state.setAiAdvice)
  const setAiTargetUse = useProjectStore((state) => state.setAiTargetUse)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    const imageData = toRealImageData(originalImage)
    if (!imageData) {
      setError('Please upload an image first.')
      return
    }

    setLoading(true)
    setError(null)
    setAiAdvice(null)

    try {
      const result = await analyzeImageWithAI(imageData, targetUse)
      setAiAdvice(result)
    } catch (err) {
      console.error('AI analysis failed:', err)
      setError('AI analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const targetUseOptions = [
    { value: 'general', label: 'General print' },
    { value: 'magazine', label: 'Magazine / editorial' },
    { value: 'brochure', label: 'Brochure / poster' },
    { value: 'photo_print', label: 'Photo print' },
    { value: 'packaging', label: 'Packaging' }
  ]

  const profileTags: Record<string, string> = {
    sRGB: 'RGB',
    'Adobe RGB': 'RGB',
    'Coated FOGRA39': 'CMYK',
    'Uncoated FOGRA29': 'CMYK',
    'Japan Color 2001 Coated': 'CMYK',
    GRACoL2006: 'CMYK'
  }

  return (
    <Card
      className={className}
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-light)'
      }}
      styles={{ body: { padding: 16 } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <RobotOutlined style={{ fontSize: 18, color: '#fff' }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0, fontSize: 15 }}>
            AI Color Advisor
          </Title>
          <Text type="secondary" style={{ fontSize: 11 }}>
            DeepSeek or fallback rule set
          </Text>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
          Target output
        </Text>
        <Select value={targetUse} onChange={setAiTargetUse} options={targetUseOptions} style={{ width: '100%' }} size="small" />
      </div>

      <Button
        type="primary"
        icon={<ThunderboltOutlined />}
        onClick={handleAnalyze}
        loading={loading}
        disabled={!originalImage}
        block
        style={{
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none'
        }}
      >
        {loading ? 'Analyzing...' : 'Run AI analysis'}
      </Button>

      {error && <Alert type="error" message={error} showIcon style={{ marginTop: 12 }} />}

      {advice && (
        <div style={{ marginTop: 16 }}>
          <Divider style={{ margin: '12px 0' }} />

          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              Recommended profile
            </Text>
            <Tag color={advice.profileType === 'cmyk' ? 'blue' : 'green'} style={{ fontSize: 13, padding: '4px 8px' }}>
              {advice.recommendedProfile} ({profileTags[advice.recommendedProfile] || 'RGB'})
            </Tag>
            <Tag style={{ marginLeft: 8 }}>{advice.source}</Tag>
            <Tag color={advice.confidence === 'high' ? 'green' : advice.confidence === 'medium' ? 'gold' : 'default'}>
              confidence: {advice.confidence}
            </Tag>
          </div>

          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              Reasoning
            </Text>
            <Paragraph style={{ fontSize: 12, margin: 0, color: 'var(--color-text-secondary)' }}>{advice.reasoning}</Paragraph>
          </div>

          {advice.approximationNotice && (
            <Alert type="warning" showIcon style={{ marginBottom: 12 }} message={advice.approximationNotice} />
          )}

          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              Suggested adjustments
            </Text>
            <Space wrap size={4}>
              <Tag icon={<CheckCircleOutlined />} color="processing">
                temperature: {advice.colorTemperature}
              </Tag>
              <Tag icon={<CheckCircleOutlined />} color="processing">
                saturation: {advice.saturation}
              </Tag>
              <Tag icon={<CheckCircleOutlined />} color="processing">
                contrast: {advice.contrast}
              </Tag>
            </Space>
          </div>

          <div>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              <WarningOutlined style={{ marginRight: 4 }} />
              Print tips
            </Text>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: 'var(--color-text-secondary)' }}>
              {advice.printingTips.map((tip, index) => (
                <li key={index} style={{ marginBottom: 4 }}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!originalImage && !loading && !advice && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-secondary)' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Upload an image to unlock AI-assisted color guidance.
          </Text>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin size="small" />
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              AI is evaluating image color characteristics...
            </Text>
          </div>
        </div>
      )}
    </Card>
  )
}
