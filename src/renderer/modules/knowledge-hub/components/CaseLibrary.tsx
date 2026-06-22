import { Card, Typography, Row, Col, Tag } from 'antd'
import { useState } from 'react'
import { PictureOutlined, PrinterOutlined } from '@ant-design/icons'

const { Text, Paragraph } = Typography

interface Case {
  id: string
  title: string
  description: string
  tags: string[]
  difficulty: '入门' | '进阶' | '高级'
  digitalColor: string
  printColor: string
}

const MOCK_CASES: Case[] = [
  {
    id: '1',
    title: '品牌视觉跨媒介一致性',
    description: '分析某品牌从数字官网到印刷宣传册的色彩管理流程，探讨如何保持品牌色在不同媒介间的一致性。',
    tags: ['色彩管理', '品牌一致性', 'CMYK'],
    difficulty: '进阶',
    digitalColor: '#1E90FF',
    printColor: '#1874CD'
  },
  {
    id: '2',
    title: '包装设计印刷适配',
    description: '食品包装设计从屏幕到实际印刷的完整流程，解析分辨率、出血、色域等关键控制点。',
    tags: ['包装设计', '分辨率', '出血'],
    difficulty: '高级',
    digitalColor: '#FF6347',
    printColor: '#DC143C'
  },
  {
    id: '3',
    title: '企业名片印刷色彩管理',
    description: '名片设计中的色彩管理要点，确保企业标准色在胶印过程中的准确性。',
    tags: ['名片印刷', '企业VI', '色彩校样'],
    difficulty: '入门',
    digitalColor: '#2C5F2D',
    printColor: '#1E4620'
  }
]

export default function CaseLibrary() {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)

  return (
    <Card title="跨媒介设计案例库">
      <Row gutter={[16, 16]}>
        {MOCK_CASES.map((c) => (
          <Col span={12} key={c.id}>
            <Card
              hoverable
              onClick={() => setSelectedCase(c)}
              cover={
                <div style={{ background: '#f5f5f5', height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      backgroundColor: c.digitalColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  >
                    <PictureOutlined style={{ fontSize: 32, color: '#fff' }} />
                  </div>
                </div>
              }
            >
              <Card.Meta
                title={c.title}
                description={
                  <div>
                    <Paragraph ellipsis={{ rows: 2 }}>{c.description}</Paragraph>
                    <div style={{ marginTop: 8 }}>
                      {c.tags.map((tag) => (
                        <Tag key={tag} style={{ marginBottom: 4 }}>
                          {tag}
                        </Tag>
                      ))}
                      <Tag color={c.difficulty === '入门' ? 'green' : c.difficulty === '进阶' ? 'orange' : 'red'}>{c.difficulty}</Tag>
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {selectedCase && (
        <Card title={selectedCase.title} extra={<Text type="secondary" onClick={() => setSelectedCase(null)} style={{ cursor: 'pointer' }}>关闭</Text>} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Text type="secondary">数字显示效果</Text>
              <div
                style={{
                  height: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 8,
                  backgroundColor: '#fafafa',
                  borderRadius: 8,
                  border: '1px solid #e8e8e8'
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 12,
                    backgroundColor: selectedCase.digitalColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                >
                  <PictureOutlined style={{ fontSize: 48, color: '#fff' }} />
                </div>
                <Text type="secondary" style={{ marginTop: 12 }}>数字显示</Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">印刷成品效果</Text>
              <div
                style={{
                  height: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 8,
                  backgroundColor: '#fafafa',
                  borderRadius: 8,
                  border: '1px solid #e8e8e8'
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 12,
                    backgroundColor: selectedCase.printColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    filter: 'saturate(0.85) contrast(1.05)'
                  }}
                >
                  <PrinterOutlined style={{ fontSize: 48, color: '#fff' }} />
                </div>
                <Text type="secondary" style={{ marginTop: 12 }}>模拟印刷</Text>
              </div>
            </Col>
          </Row>
          <Paragraph style={{ marginTop: 16 }}>{selectedCase.description}</Paragraph>
        </Card>
      )}
    </Card>
  )
}
