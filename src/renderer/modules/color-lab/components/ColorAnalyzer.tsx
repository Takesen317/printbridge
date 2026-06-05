import { Alert, Badge, Card, Col, Progress, Row, Statistic, Tag } from 'antd'
import { useColorStore } from '../../../store/color'
import { isIccEngineReady } from '../../../services/color-engine'

export default function ColorAnalyzer() {
  const { analysis, warningThreshold, activeProfile, iccEngineStatus } = useColorStore()
  const iccReady = isIccEngineReady()

  if (!analysis) {
    return (
      <Card title="色彩分析">
        <div style={{ textAlign: 'center', color: '#999' }}>请先导入图像并执行分析。</div>
      </Card>
    )
  }

  const { representativeColor, convertedColor, averageDeltaE, maxDeltaE, isInGamut, inGamutPercentage, sampleCount } = analysis

  return (
    <Card title="色彩分析">
      {iccEngineStatus === 'degraded' && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="ICC 引擎未完全可用"
          description="当前结果使用简化转换模型，适合演示和初步评估，不应视为正式打样结论。"
        />
      )}

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#666', fontSize: 12 }}>分析基于 {sampleCount} 个采样点。</div>
        <Badge status={iccReady ? 'success' : 'warning'} text={iccReady ? 'ICC/WASM 模式' : '简化估算模式'} />
      </div>

      {activeProfile?.isCustom && (
        <div
          style={{
            marginBottom: 16,
            padding: '8px 12px',
            backgroundColor: '#f6ffed',
            borderRadius: 4,
            border: '1px solid #b7eb8f'
          }}
        >
          <span style={{ color: '#389e0d', fontSize: 12 }}>当前使用自定义 ICC 配置：{activeProfile.name}</span>
        </div>
      )}

      <Row gutter={16}>
        <Col span={12}>
          <Statistic title="代表色 (RGB)" value={`RGB(${representativeColor.r}, ${representativeColor.g}, ${representativeColor.b})`} />
          <div
            style={{
              width: '100%',
              height: 60,
              marginTop: 8,
              backgroundColor: `rgb(${representativeColor.r}, ${representativeColor.g}, ${representativeColor.b})`,
              borderRadius: 4,
              border: '1px solid #d9d9d9'
            }}
          />
        </Col>
        <Col span={12}>
          <Statistic title="估算转换结果 (CMYK)" value={`CMYK(${convertedColor.c}, ${convertedColor.m}, ${convertedColor.y}, ${convertedColor.k})`} />
          <div
            style={{
              width: '100%',
              height: 60,
              marginTop: 8,
              backgroundColor: `rgb(${representativeColor.r}, ${representativeColor.g}, ${representativeColor.b})`,
              borderRadius: 4,
              border: '1px solid #d9d9d9',
              filter: 'saturate(0.8)'
            }}
          />
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Statistic
            title="平均色差 ΔE"
            value={averageDeltaE}
            precision={2}
            valueStyle={{ color: averageDeltaE < warningThreshold ? '#52c41a' : '#ff4d4f' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="最大色差 ΔE"
            value={maxDeltaE}
            precision={2}
            valueStyle={{ color: maxDeltaE > warningThreshold * 2 ? '#ff4d4f' : '#faad14' }}
          />
        </Col>
        <Col span={8}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 14, marginBottom: 8 }}>采样点色域命中率</div>
            <Progress
              percent={inGamutPercentage}
              status={inGamutPercentage > 90 ? 'success' : inGamutPercentage > 70 ? 'normal' : 'exception'}
              strokeColor={inGamutPercentage > 90 ? '#52c41a' : inGamutPercentage > 70 ? '#faad14' : '#ff4d4f'}
            />
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{inGamutPercentage}% 的采样点位于目标色域内</div>
          </div>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Statistic
            title="整体判断"
            value={isInGamut ? '总体可控' : '存在风险'}
            suffix={<Tag color={isInGamut ? 'green' : 'orange'}>{isInGamut ? 'OK' : 'CHECK'}</Tag>}
          />
        </Col>
        <Col span={12}>
          <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            {isInGamut
              ? '图像整体更接近可印刷范围，但仍建议结合软打样确认关键区域。'
              : '图像中存在高风险颜色，建议结合 ICC 预览和人工审查判断是否需要调整。'}
          </div>
        </Col>
      </Row>
    </Card>
  )
}
