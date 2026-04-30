/**
 * AI Assistant Panel Component
 *
 * Provides AI-powered color analysis and ICC profile recommendations.
 * Uses DeepSeek LLM to analyze images and suggest optimal print settings.
 */

import { Card, Button, Select, Spin, Tag, Typography, Space, Divider, Alert } from 'antd'
import { RobotOutlined, ThunderboltOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useProjectStore } from '../../store/project'
import { toRealImageData } from '../../utils/image-utils'
import { analyzeImageWithAI, AIColorAdvice, AIColorAnalysisRequest } from '../../services/ai-color-advisor'

const { Title, Text, Paragraph } = Typography

interface AiAssistantProps {
  className?: string
}

export default function AiAssistant({ className }: AiAssistantProps) {
  const originalImage = useProjectStore((state) => state.originalImage)
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState<AIColorAdvice | null>(null)
  const [targetUse, setTargetUse] = useState<AIColorAnalysisRequest['targetUse']>('general')
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    const imageData = toRealImageData(originalImage)
    if (!imageData) {
      setError('请先上传图片')
      return
    }

    setLoading(true)
    setError(null)
    setAdvice(null)

    try {
      const result = await analyzeImageWithAI(imageData, targetUse)
      setAdvice(result)
    } catch (err) {
      console.error('AI analysis failed:', err)
      setError('AI分析失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const targetUseOptions = [
    { value: 'general', label: '通用印刷' },
    { value: 'magazine', label: '杂志/期刊' },
    { value: 'brochure', label: '宣传册/海报' },
    { value: 'photo_print', label: '照片打印' },
    { value: 'packaging', label: '产品包装' }
  ]

  const profileTags: Record<string, string> = {
    'sRGB': 'RGB',
    'Adobe RGB': 'RGB',
    'Coated FOGRA39': 'CMYK',
    'Uncoated FOGRA29': 'CMYK',
    'Japan Color 2001 Coated': 'CMYK',
    'GRACoL2006': 'CMYK'
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <RobotOutlined style={{ fontSize: 18, color: '#fff' }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0, fontSize: 15 }}>AI色彩顾问</Title>
          <Text type="secondary" style={{ fontSize: 11 }}>DeepSeek 智能分析</Text>
        </div>
      </div>

      {/* Target Use Selector */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
          印刷用途
        </Text>
        <Select
          value={targetUse}
          onChange={setTargetUse}
          options={targetUseOptions}
          style={{ width: '100%' }}
          size="small"
        />
      </div>

      {/* Analyze Button */}
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
        {loading ? '分析中...' : 'AI智能分析'}
      </Button>

      {/* Error Message */}
      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          style={{ marginTop: 12 }}
        />
      )}

      {/* AI Result */}
      {advice && (
        <div style={{ marginTop: 16 }}>
          <Divider style={{ margin: '12px 0' }} />

          {/* Recommended Profile */}
          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              推荐配置文件
            </Text>
            <Tag
              color={advice.profileType === 'cmyk' ? 'blue' : 'green'}
              style={{ fontSize: 13, padding: '4px 8px' }}
            >
              {advice.recommendedProfile} ({profileTags[advice.recommendedProfile] || 'RGB'})
            </Tag>
          </div>

          {/* Reasoning */}
          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              分析理由
            </Text>
            <Paragraph style={{ fontSize: 12, margin: 0, color: 'var(--color-text-secondary)' }}>
              {advice.reasoning}
            </Paragraph>
          </div>

          {/* Color Adjustments */}
          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              色彩调整建议
            </Text>
            <Space wrap size={4}>
              <Tag icon={<CheckCircleOutlined />} color="processing">
                色温: {advice.colorTemperature}
              </Tag>
              <Tag icon={<CheckCircleOutlined />} color="processing">
                饱和度: {advice.saturation}
              </Tag>
              <Tag icon={<CheckCircleOutlined />} color="processing">
                对比度: {advice.contrast}
              </Tag>
            </Space>
          </div>

          {/* Printing Tips */}
          <div>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              <WarningOutlined style={{ marginRight: 4 }} />
              印刷提示
            </Text>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: 'var(--color-text-secondary)' }}>
              {advice.printingTips.map((tip, index) => (
                <li key={index} style={{ marginBottom: 4 }}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* No Image Hint */}
      {!originalImage && !loading && !advice && (
        <div style={{
          textAlign: 'center',
          padding: '20px 0',
          color: 'var(--color-text-secondary)'
        }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            上传图片后点击"AI智能分析"
            <br />
            获取专业色彩建议
          </Text>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin size="small" />
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              AI正在分析图像色彩...
            </Text>
          </div>
        </div>
      )}
    </Card>
  )
}
