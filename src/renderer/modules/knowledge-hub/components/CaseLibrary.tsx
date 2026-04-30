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
    description: '分析某品牌从数字官网到印刷宣传册的色彩管理流程，探讨品牌色在不同媒介间的一致性保持方法。',
    tags: ['色彩管理', '品牌一致性', 'CMYK'],
    difficulty: '进阶',
    digitalColor: '#1E90FF',
    printColor: '#1874CD'
  },
  {
    id: '2',
    title: '包装设计印刷适配',
    description: '食品包装设计从屏幕设计到实际印刷的完整流程，解析分辨率、出血、色域等关键控制点。',
    tags: ['包装设计', '分辨率', '出血'],
    difficulty: '高级',
    digitalColor: '#FF6347',
    printColor: '#DC143C'
  },
  {
    id: '3',
    title: '企业名片印刷色彩管理',
    description: '名片设计中的色彩管理要点，探讨如何确保企业标准色在胶印过程中的准确性，包括色值指定和色彩校样流程。',
    tags: ['名片印刷', '企业VI', '色彩校样'],
    difficulty: '入门',
    digitalColor: '#2C5F2D',
    printColor: '#1E4620'
  },
  {
    id: '4',
    title: '杂志封面设计色域管理',
    description: '高端杂志封面设计从RGB色彩空间到CMYK印刷的转换策略，分析大面积实地色与渐变色的处理技巧。',
    tags: ['杂志', '封面设计', '渐变色'],
    difficulty: '高级',
    digitalColor: '#C71F37',
    printColor: '#9B1B30'
  },
  {
    id: '5',
    title: '海报设计出血与裁切',
    description: '户外大幅面海报设计中的出血设置、分辨率要求和色彩管理模式，确保远距离观看效果与近看细节的平衡。',
    tags: ['海报设计', '大幅面印刷', '分辨率'],
    difficulty: '进阶',
    digitalColor: '#FF6B35',
    printColor: '#E85A24'
  },
  {
    id: '6',
    title: '书籍内页色彩还原',
    description: '精装书籍内页印刷中的色彩管理策略，分析光铜版与哑光纸对色彩还原的影响，以及RGB到CMYK的转换曲线。',
    tags: ['书籍印刷', '纸张选择', '色彩还原'],
    difficulty: '进阶',
    digitalColor: '#4A4A4A',
    printColor: '#3A3A3A'
  },
  {
    id: '7',
    title: '瓦楞纸箱印刷适性',
    description: '电商物流包装箱印刷的特殊性，分析牛皮纸、涂布纸对色彩的影响，以及如何在大面积棕色基底上实现精准色彩。',
    tags: ['瓦楞纸', '包装印刷', '特殊介质'],
    difficulty: '高级',
    digitalColor: '#8B4513',
    printColor: '#6B3410'
  },
  {
    id: '8',
    title: 'T恤丝网印花色彩控制',
    description: '服装印花设计中的色彩管理，分析CMYK四色印花与专色印花的优劣势，以及如何在深色面料上实现鲜艳色彩。',
    tags: ['服装印花', '丝网印', '专色'],
    difficulty: '高级',
    digitalColor: '#9400D3',
    printColor: '#7B1FA2'
  },
  {
    id: '9',
    title: '展览展示画面输出',
    description: '博物馆展览图版设计中的色彩管理，分析不同光源下（自然光、射灯、LED）色彩还原的差异与应对策略。',
    tags: ['展览设计', '色彩一致性', '光源'],
    difficulty: '进阶',
    digitalColor: '#00CED1',
    printColor: '#008B8B'
  },
  {
    id: '10',
    title: '环保包装材料色彩方案',
    description: '再生纸、竹纸等环保材料印刷中的色彩管理，分析材料吸墨性差异对色彩饱和度的影响及补偿方案。',
    tags: ['环保材料', '包装设计', '吸墨性'],
    difficulty: '进阶',
    digitalColor: '#556B2F',
    printColor: '#3D4F22'
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
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    backgroundColor: c.digitalColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}>
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
                      {c.tags.map(tag => <Tag key={tag} style={{ marginBottom: 4 }}>{tag}</Tag>)}
                      <Tag color={c.difficulty === '入门' ? 'green' : c.difficulty === '进阶' ? 'orange' : 'red'}>
                        {c.difficulty}
                      </Tag>
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {selectedCase && (
        <Card
          title={selectedCase.title}
          extra={<Text type="secondary" onClick={() => setSelectedCase(null)} style={{ cursor: 'pointer' }}>关闭</Text>}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Text type="secondary">数字显示效果</Text>
              <div style={{
                height: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 8,
                backgroundColor: '#fafafa',
                borderRadius: 8,
                border: '1px solid #e8e8e8'
              }}>
                <div style={{
                  width: 120,
                  height: 120,
                  borderRadius: 12,
                  backgroundColor: selectedCase.digitalColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <PictureOutlined style={{ fontSize: 48, color: '#fff' }} />
                </div>
                <Text type="secondary" style={{ marginTop: 12 }}>数字显示</Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">印刷成品效果</Text>
              <div style={{
                height: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 8,
                backgroundColor: '#fafafa',
                borderRadius: 8,
                border: '1px solid #e8e8e8'
              }}>
                <div style={{
                  width: 120,
                  height: 120,
                  borderRadius: 12,
                  backgroundColor: selectedCase.printColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  filter: 'saturate(0.85) contrast(1.05)'
                }}>
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
