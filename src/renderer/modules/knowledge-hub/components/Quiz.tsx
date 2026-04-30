import { Card, Radio, Button, Typography, Space, message } from 'antd'
import { useState, useEffect } from 'react'

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
    question: '以下哪个不是印刷前检查的常规项目？',
    options: ['分辨率检查', '色彩模式检查', '音频文件检查', '出血检查'],
    correctIndex: 2,
    explanation: '音频文件检查与印刷准备无关。印刷前通常需要检查分辨率、色彩模式和出血。'
  },
  {
    id: '2',
    question: 'CMYK 色彩空间中，K 代表什么？',
    options: ['红色', '黑色', '绿色', '透明度'],
    correctIndex: 1,
    explanation: 'K 代表黑色（Key/Black），用于控制图像的暗调部分。'
  },
  {
    id: '3',
    question: '标准印刷分辨率为多少 DPI？',
    options: ['72 DPI', '150 DPI', '300 DPI', '600 DPI'],
    correctIndex: 2,
    explanation: '300 DPI 是印刷行业的标准分辨率，低于此分辨率可能导致印刷成品模糊。'
  }
]

export default function Quiz() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [savedScore, setSavedScore] = useState<QuizScore | null>(null)

  // 从 localStorage 加载保存的分数
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setSavedScore(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse stored quiz score:', e)
        // 清除损坏的存储数据
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const currentQuestion = MOCK_QUIZZES[currentIndex]

  const handleSubmit = () => {
    if (selectedAnswer === null) {
      message.warning('请选择一个答案')
      return
    }

    setShowResult(true)
    if (selectedAnswer === currentQuestion.correctIndex) {
      setScore(s => s + 1)
      message.success('回答正确！')
    }
  }

  const handleNext = () => {
    if (currentIndex < MOCK_QUIZZES.length - 1) {
      setCurrentIndex(i => i + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      // 保存分数到 localStorage
      const finalScore: QuizScore = {
        score,
        totalQuestions: MOCK_QUIZZES.length,
        date: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalScore))
      setSavedScore(finalScore)
      message.info(`测验完成！得分：${score}/${MOCK_QUIZZES.length}`)
    }
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
        <div style={{
          marginBottom: 16,
          padding: '8px 12px',
          background: 'var(--color-primary-bg)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 13
        }}>
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
          <Title level={5} style={{ marginBottom: 16 }}>第 {currentIndex + 1} 题</Title>
          <Text style={{ fontSize: 16 }}>{currentQuestion.question}</Text>
        </div>

        <Radio.Group
          value={selectedAnswer}
          onChange={(e) => setSelectedAnswer(e.target.value)}
          disabled={showResult}
          style={{ width: '100%' }}
        >
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
              {selectedAnswer === currentQuestion.correctIndex ? '回答正确！' : '回答错误'}
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
