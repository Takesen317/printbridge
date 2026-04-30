import { Card, Slider, Typography, Row, Col, Space } from 'antd'
import { useState } from 'react'
import { rgbToCmyk } from '../../../utils/color-convert'

const { Text } = Typography

export default function InteractiveDemo() {
  const [saturation, setSaturation] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [redValue, setRedValue] = useState(255)
  const [greenValue, setGreenValue] = useState(0)
  const [blueValue, setBlueValue] = useState(128)

  // 正确的处理顺序：先饱和度，再对比度
  // 饱和度调整：将颜色向灰色靠拢或远离
  // saturation = 1: 无变化
  // saturation = 0: 完全去饱和（变成灰色）
  // saturation > 1: 增强饱和度
  const MID_GRAY = 128
  const saturationFactor = saturation / 100

  // 第一步：应用饱和度
  const desaturatedR = MID_GRAY + (redValue - MID_GRAY) * saturationFactor
  const desaturatedG = MID_GRAY + (greenValue - MID_GRAY) * saturationFactor
  const desaturatedB = MID_GRAY + (blueValue - MID_GRAY) * saturationFactor

  // 第二步：应用对比度
  // contrast = 100: 无变化
  // contrast < 100: 压缩范围（对比度降低）
  // contrast > 100: 扩展范围（对比度增加）
  const contrastFactor = contrast / 100

  const adjustedR = Math.min(255, Math.max(0, Math.round(((desaturatedR / 255 - 0.5) * contrastFactor + 0.5) * 255)))
  const adjustedG = Math.min(255, Math.max(0, Math.round(((desaturatedG / 255 - 0.5) * contrastFactor + 0.5) * 255)))
  const adjustedB = Math.min(255, Math.max(0, Math.round(((desaturatedB / 255 - 0.5) * contrastFactor + 0.5) * 255)))

  const cmyk = rgbToCmyk({ r: adjustedR, g: adjustedG, b: adjustedB })

  return (
    <Card title="交互式色彩模拟演示">
      <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
        调整下方参数，观察颜色如何从 RGB 转换到 CMYK，以及参数变化对最终印刷效果的影响。
      </Text>

      <Row gutter={16}>
        <Col span={12}>
          <div
            style={{
              width: '100%',
              height: 120,
              backgroundColor: `rgb(${adjustedR}, ${adjustedG}, ${adjustedB})`,
              borderRadius: 8,
              border: '1px solid #d9d9d9'
            }}
          />
          <Text type="secondary" style={{ display: 'block', marginTop: 8, textAlign: 'center' }}>
            RGB({adjustedR}, {adjustedG}, {adjustedB})
          </Text>
        </Col>
        <Col span={12}>
          <div
            style={{
              width: '100%',
              height: 120,
              backgroundColor: `rgb(${adjustedR}, ${adjustedG}, ${adjustedB})`,
              borderRadius: 8,
              border: '1px solid #d9d9d9',
              filter: `saturate(${saturationFactor}) contrast(${contrastFactor})`
            }}
          />
          <Text type="secondary" style={{ display: 'block', marginTop: 8, textAlign: 'center' }}>
            CMYK({cmyk.c}, {cmyk.m}, {cmyk.y}, {cmyk.k})
          </Text>
        </Col>
      </Row>

      <Space direction="vertical" style={{ width: '100%', marginTop: 24 }}>
        <div>
          <Text>红色 (R): {redValue}</Text>
          <Slider min={0} max={255} value={redValue} onChange={setRedValue} />
        </div>
        <div>
          <Text>绿色 (G): {greenValue}</Text>
          <Slider min={0} max={255} value={greenValue} onChange={setGreenValue} />
        </div>
        <div>
          <Text>蓝色 (B): {blueValue}</Text>
          <Slider min={0} max={255} value={blueValue} onChange={setBlueValue} />
        </div>
        <div>
          <Text>饱和度：{saturation}%</Text>
          <Slider min={0} max={150} value={saturation} onChange={setSaturation} />
        </div>
        <div>
          <Text>对比度：{contrast}%</Text>
          <Slider min={50} max={150} value={contrast} onChange={setContrast} />
        </div>
      </Space>
    </Card>
  )
}
