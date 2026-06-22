import { Button, Card, List, Tag, Typography } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { PrintProblem } from '../../../services/print-checker'

const { Text } = Typography

interface ProblemListProps {
  problems: PrintProblem[]
  onFixClick?: (problem: PrintProblem) => void
}

export default function ProblemList({ problems, onFixClick }: ProblemListProps) {
  const severityConfig = {
    error: {
      icon: <CloseCircleOutlined style={{ color: 'var(--color-error)', fontSize: 20 }} />,
      tag: <Tag color="red" style={{ borderRadius: 'var(--radius-sm)' }}>错误</Tag>,
      borderColor: 'var(--color-error)'
    },
    warning: {
      icon: <WarningOutlined style={{ color: 'var(--color-warning)', fontSize: 20 }} />,
      tag: <Tag color="orange" style={{ borderRadius: 'var(--radius-sm)' }}>警告</Tag>,
      borderColor: 'var(--color-warning)'
    },
    info: {
      icon: <InfoCircleOutlined style={{ color: 'var(--color-primary)', fontSize: 20 }} />,
      tag: <Tag color="blue" style={{ borderRadius: 'var(--radius-sm)' }}>提示</Tag>,
      borderColor: 'var(--color-primary)'
    }
  }

  if (problems.length === 0) {
    return (
      <Card
        title="问题检查"
        style={{
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border-light)'
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: 32,
            background: 'var(--color-success-bg)',
            borderRadius: 'var(--radius-lg)',
            margin: 'var(--space-sm)'
          }}
        >
          <CheckCircleOutlined style={{ fontSize: 48, color: 'var(--color-success)' }} />
          <div style={{ marginTop: 16 }}>
            <Text strong style={{ fontSize: 18, color: 'var(--color-text-primary)' }}>
              未检测到问题
            </Text>
          </div>
          <Text type="secondary">设计稿已准备就绪，可以进行印前输出。</Text>
        </div>
      </Card>
    )
  }

  return (
    <Card
      title={`检测到 ${problems.length} 个问题`}
      style={{
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border-light)'
      }}
    >
      <List
        dataSource={problems}
        renderItem={(problem) => {
          const config = severityConfig[problem.severity]
          return (
            <List.Item
              style={{
                marginBottom: 'var(--space-sm)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                borderLeft: `4px solid ${config.borderColor}`,
                background: 'var(--color-surface)',
                transition: 'all var(--transition-fast)'
              }}
              actions={[
                problem.suggestedFix ? (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => onFixClick?.(problem)}
                    style={{
                      borderRadius: 'var(--radius-sm)',
                      background: config.borderColor
                    }}
                  >
                    修正
                  </Button>
                ) : null
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={config.icon}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {config.tag}
                    <Text strong style={{ color: 'var(--color-text-primary)' }}>
                      {problem.title}
                    </Text>
                  </div>
                }
                description={
                  <div style={{ marginTop: 'var(--space-xs)' }}>
                    <Text style={{ color: 'var(--color-text-secondary)' }}>{problem.description}</Text>
                    {problem.suggestedFix && (
                      <div
                        style={{
                          marginTop: 'var(--space-xs)',
                          padding: 'var(--space-xs) var(--space-sm)',
                          background: 'var(--color-primary-bg)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 12
                        }}
                      >
                        <Text style={{ color: 'var(--color-primary)' }}>建议修正：{problem.suggestedFix}</Text>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )
        }}
      />
    </Card>
  )
}
