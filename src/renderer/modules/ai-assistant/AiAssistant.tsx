import { CheckCircleOutlined, RobotOutlined, ThunderboltOutlined, WarningOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Divider, Select, Space, Spin, Tag, Typography } from 'antd'
import { useState } from 'react'
import { translate } from '../../constants/i18n'
import { analyzeImageWithAI } from '../../services/ai-color-advisor'
import { useLocaleStore } from '../../store/locale'
import { useProjectStore } from '../../store/project'
import { toRealImageData } from '../../utils/image-utils'

const { Title, Text, Paragraph } = Typography

interface AiAssistantProps {
  className?: string
}

export default function AiAssistant({ className }: AiAssistantProps) {
  const locale = useLocaleStore((state) => state.locale)
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
      setError(translate(locale, 'ai.uploadFirst'))
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
      setError(translate(locale, 'ai.failed'))
    } finally {
      setLoading(false)
    }
  }

  const targetUseOptions = [
    { value: 'general', label: translate(locale, 'ai.target.general') },
    { value: 'magazine', label: translate(locale, 'ai.target.magazine') },
    { value: 'brochure', label: translate(locale, 'ai.target.brochure') },
    { value: 'photo_print', label: translate(locale, 'ai.target.photoPrint') },
    { value: 'packaging', label: translate(locale, 'ai.target.packaging') }
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
            {translate(locale, 'ai.title')}
          </Title>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {translate(locale, 'ai.subtitle')}
          </Text>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
          {translate(locale, 'ai.targetOutput')}
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
        {loading ? translate(locale, 'ai.running') : translate(locale, 'ai.run')}
      </Button>

      {error && <Alert type="error" message={error} showIcon style={{ marginTop: 12 }} />}

      {advice && (
        <div style={{ marginTop: 16 }}>
          <Divider style={{ margin: '12px 0' }} />

          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              {translate(locale, 'ai.recommendedProfile')}
            </Text>
            <Tag color={advice.profileType === 'cmyk' ? 'blue' : 'green'} style={{ fontSize: 13, padding: '4px 8px' }}>
              {advice.recommendedProfile} ({profileTags[advice.recommendedProfile] || 'RGB'})
            </Tag>
            <Tag style={{ marginLeft: 8 }}>{advice.source}</Tag>
            <Tag color={advice.confidence === 'high' ? 'green' : advice.confidence === 'medium' ? 'gold' : 'default'}>
              {translate(locale, 'ai.confidence', { value: advice.confidence })}
            </Tag>
          </div>

          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              {translate(locale, 'ai.reasoningTitle')}
            </Text>
            <Paragraph style={{ fontSize: 12, margin: 0, color: 'var(--color-text-secondary)' }}>{advice.reasoning}</Paragraph>
          </div>

          {advice.approximationNotice && (
            <Alert type="warning" showIcon style={{ marginBottom: 12 }} message={advice.approximationNotice} />
          )}

          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              {translate(locale, 'ai.suggestedAdjustments')}
            </Text>
            <Space wrap size={4}>
              <Tag icon={<CheckCircleOutlined />} color="processing">
                {translate(locale, 'ai.temperature', { value: advice.colorTemperature })}
              </Tag>
              <Tag icon={<CheckCircleOutlined />} color="processing">
                {translate(locale, 'ai.saturation', { value: advice.saturation })}
              </Tag>
              <Tag icon={<CheckCircleOutlined />} color="processing">
                {translate(locale, 'ai.contrast', { value: advice.contrast })}
              </Tag>
            </Space>
          </div>

          <div>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              <WarningOutlined style={{ marginRight: 4 }} />
              {translate(locale, 'ai.printTips')}
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
            {translate(locale, 'ai.emptyHint')}
          </Text>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin size="small" />
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {translate(locale, 'ai.loadingHint')}
            </Text>
          </div>
        </div>
      )}
    </Card>
  )
}
