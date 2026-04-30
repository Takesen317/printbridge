import { Tabs, Card } from 'antd'
import CaseLibrary from './components/CaseLibrary'
import InteractiveDemo from './components/InteractiveDemo'
import Quiz from './components/Quiz'

export default function KnowledgeHub() {
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
          学习资源库
        </h1>
        <p style={{
          fontSize: 14,
          color: 'var(--color-text-secondary)',
          margin: 0,
        }}>
          色彩管理知识、案例分析、交互演示与自测题库
        </p>
      </div>

      <Card
        style={{
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--color-border-light)',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Tabs
          items={[
            {
              key: 'cases',
              label: '案例库',
              children: <CaseLibrary />
            },
            {
              key: 'demo',
              label: '交互演示',
              children: <InteractiveDemo />
            },
            {
              key: 'quiz',
              label: '自测题库',
              children: <Quiz />
            }
          ]}
          style={{ padding: '0 16px' }}
        />
      </Card>
    </div>
  )
}
