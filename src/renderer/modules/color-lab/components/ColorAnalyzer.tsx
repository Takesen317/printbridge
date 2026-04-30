import { Card, Statistic, Row, Col, Tag, Progress, Badge, Alert } from 'antd'
import { useColorStore } from '../../../store/color'
import { isIccEngineReady } from '../../../services/color-engine'

export default function ColorAnalyzer() {
  const { analysis, warningThreshold, activeProfile, iccEngineStatus } = useColorStore()
  const iccReady = isIccEngineReady()
  const usingCustomProfile = activeProfile?.isCustom

  if (!analysis) {
    return (
      <Card title="色彩分析">
        <div style={{ textAlign: 'center', color: '#999' }}>
          请导入图像以进行分析
        </div>
      </Card>
    )
  }

  const {
    representativeColor,
    convertedColor,
    averageDeltaE,
    maxDeltaE,
    isInGamut,
    inGamutPercentage,
    sampleCount
  } = analysis

  return (
    <Card title="色彩分析">
      {iccEngineStatus === 'degraded' && (
        <Alert
          type="warning"
          message="ICC 引擎初始化失败"
          description="使用简化色彩转换，结果可能不够精确"
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#666', fontSize: 12 }}>
          基于 {sampleCount} 个采样点的分析结果
        </div>
        <Badge
          status={iccReady ? 'success' : 'warning'}
          text={iccReady ? 'ICC 引擎就绪' : '简化转换模式'}
          style={{ fontSize: 12 }}
        />
      </div>
      {usingCustomProfile && (
        <div style={{ marginBottom: 16, padding: '8px 12px', backgroundColor: '#f6ffed', borderRadius: 4, border: '1px solid #b7eb8f' }}>
          <span style={{ color: '#52c41a', fontSize: 12 }}>
            使用自定义 ICC Profile: {activeProfile?.name}
          </span>
        </div>
      )}
      <Row gutter={16}>
        <Col span={12}>
          <Statistic
            title="代表性颜色 (RGB)"
            value={`RGB(${representativeColor.r}, ${representativeColor.g}, ${representativeColor.b})`}
          />
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
          <Statistic
            title="转换后 (CMYK)"
            value={`CMYK(${convertedColor.c}, ${convertedColor.m}, ${convertedColor.y}, ${convertedColor.k})`}
          />
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
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 14, marginBottom: 8 }}>色域内像素</div>
            <Progress
              percent={inGamutPercentage}
              status={inGamutPercentage > 90 ? 'success' : inGamutPercentage > 70 ? 'normal' : 'exception'}
              strokeColor={inGamutPercentage > 90 ? '#52c41a' : inGamutPercentage > 70 ? '#faad14' : '#ff4d4f'}
            />
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{inGamutPercentage}% 在色域内</div>
          </div>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Statistic
            title="整体色域状态"
            value={isInGamut ? '在色域内' : '超出色域'}
            suffix={<Tag color={isInGamut ? 'green' : 'orange'}>{isInGamut ? 'OK' : 'WARNING'}</Tag>}
          />
        </Col>
        <Col span={12}>
          <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            {isInGamut
              ? '图像整体颜色可以准确转换为印刷色域'
              : '部分高饱和度颜色可能无法准确印刷，建议检查鲜艳区域的色彩'}
          </div>
        </Col>
      </Row>
    </Card>
  )
}
