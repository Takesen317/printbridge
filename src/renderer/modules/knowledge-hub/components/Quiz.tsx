import { Button, Card, message, Radio, Space, Typography } from 'antd'
import { useState } from 'react'

const { Text, Title } = Typography

const STORAGE_KEY = 'printbridge-quiz'

interface QuizScore {
  score: number
  totalQuestions: number
  date: number
}

interface Question {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

const MOCK_QUIZZES: Question[] = [
  {
    id: '1',
    question: '以下哪一项不是常见的印前检查内容？',
    options: ['分辨率检查', '颜色模式检查', '音频文件检查', '出血检查'],
    correctIndex: 2,
    explanation: '音频文件与印前输出无关。印前通常关注分辨率、颜色模式和出血设置。'
  },
  {
    id: '2',
    question: 'CMYK 色彩空间中，K 代表什么？',
    options: ['红色', '黑色', '绿色', '透明度'],
    correctIndex: 1,
    explanation: 'K 表示黑版，用于加强暗部层次并稳定印刷结果。'
  },
  {
    id: '3',
    question: '常见商业印刷的目标分辨率通常是多少？',
    options: ['72 DPI', '150 DPI', '300 DPI', '600 DPI'],
    correctIndex: 2,
    explanation: '300 DPI 是常见印刷工作流的参考值，过低会导致成品发虚。'
  }
]

function readSavedScore(): QuizScore | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored) as QuizScore
  } catch (error) {
    console.error('Failed to parse stored quiz score:', error)
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export default function Quiz() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [savedScore, setSavedScore] = useState<QuizScore | null>(() => readSavedScore())

  const currentQuestion = MOCK_QUIZZES[currentIndex]

  const handleSubmit = () => {
    if (selectedAnswer === null) {
      message.warning('请选择一个答案。')
      return
    }

    setShowResult(true)
    if (selectedAnswer === currentQuestion.correctIndex) {
      setScore((value) => value + 1)
      message.success('回答正确。')
    }
  }

  const handleNext = () => {
    if (currentIndex < MOCK_QUIZZES.length - 1) {
      setCurrentIndex((value) => value + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      return
    }

    const finalScore: QuizScore = {
      score,
      totalQuestions: MOCK_QUIZZES.length,
      date: Date.now()
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalScore))
    setSavedScore(finalScore)
    message.info(`测验完成，得分：${score}/${MOCK_QUIZZES.length}`)
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
  }

  return (
    <Card title="自测题库">
      {savedScore && (
        <div
          style={{
            marginBottom: 16,
            padding: '8px 12px',
            background: 'var(--color-primary-bg)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13
          }}
        >
          <Text type="secondary">
            上次得分：{savedScore.score}/{savedScore.totalQuestions}
            <Button type="link" size="small" onClick={handleReset} style={{ padding: 0, marginLeft: 8 }}>
              重新测验
            </Button>
          </Text>
        </div>
      )}

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Title level={5} style={{ marginBottom: 16 }}>
            第 {currentIndex + 1} 题
          </Title>
          <Text style={{ fontSize: 16 }}>{currentQuestion.question}</Text>
        </div>

        <Radio.Group value={selectedAnswer} onChange={(event) => setSelectedAnswer(event.target.value)} disabled={showResult} style={{ width: '100%' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {currentQuestion.options.map((option, index) => (
              <Radio key={index} value={index} style={{ fontSize: 16 }}>
                {option}
              </Radio>
            ))}
          </Space>
        </Radio.Group>

        {showResult && (
          <Card style={{ background: selectedAnswer === currentQuestion.correctIndex ? '#f6ffed' : '#fff1f0' }}>
            <Text style={{ display: 'block', marginBottom: 8 }}>
              {selectedAnswer === currentQuestion.correctIndex ? '回答正确。' : '回答错误。'}
            </Text>
            <Text type="secondary">{currentQuestion.explanation}</Text>
          </Card>
        )}

        <Space>
          <Button type="primary" onClick={handleSubmit} disabled={showResult}>
            提交答案
          </Button>
          <Button onClick={handleNext} disabled={!showResult}>
            {currentIndex < MOCK_QUIZZES.length - 1 ? '下一题' : '查看结果'}
          </Button>
        </Space>
      </Space>
    </Card>
  )
}
