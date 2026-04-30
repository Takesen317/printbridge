import { useState, useEffect, Component, type ReactNode } from 'react'
import BasicLayout from './components/Layout/BasicLayout'
import ColorLab from './modules/color-lab/ColorLab'
import CrossPreview from './modules/cross-preview/CrossPreview'
import PrintAdapter from './modules/print-adapter/PrintAdapter'
import KnowledgeHub from './modules/knowledge-hub/KnowledgeHub'
import { message } from 'antd'
import { MODULE_CONFIG, type ModuleType } from './config/modules'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Render error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>渲染出错</h2>
          <p style={{ color: '#666' }}>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>重新加载</button>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('color-lab')

  // IPC menu action handler
  useEffect(() => {
    if (!window.electronAPI?.onMenuAction) return

    const cleanup = window.electronAPI.onMenuAction((action: string) => {
      if (action === 'import') {
        document.getElementById('file-input')?.click()
      } else if (action === 'export') {
        // Trigger the export button in ColorLab if available
        const exportButton = document.getElementById('export-button')
        if (exportButton) {
          (exportButton as HTMLButtonElement).click()
        } else {
          message.warning('请先打开色彩管理模块')
        }
      }
    })

    return cleanup
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + O: Open file
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault()
        document.getElementById('file-input')?.click()
      }
      // Ctrl/Cmd + S: Export
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        // Trigger the export button in ColorLab if available
        const exportButton = document.getElementById('export-button')
        if (exportButton) {
          (exportButton as HTMLButtonElement).click()
        } else {
          message.warning('请先打开色彩管理模块')
        }
      }
      // Ctrl/Cmd + 1-4: Switch modules
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
        e.preventDefault()
        const index = parseInt(e.key) - 1
        if (MODULE_CONFIG[index]) {
          setActiveModule(MODULE_CONFIG[index].key)
        }
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  // Validate activeModule against config
  useEffect(() => {
    const isValidModule = MODULE_CONFIG.some(m => m.key === activeModule)
    if (!isValidModule) {
      setActiveModule('color-lab')
    }
  }, [activeModule, MODULE_CONFIG])

  const renderModule = () => {
    switch (activeModule) {
      case 'color-lab':
        return <ColorLab />
      case 'cross-preview':
        return <CrossPreview />
      case 'print-adapter':
        return <PrintAdapter />
      case 'knowledge-hub':
        return <KnowledgeHub />
      default:
        return <ColorLab />
    }
  }

  return (
    <ErrorBoundary>
      <BasicLayout activeModule={activeModule} onModuleChange={setActiveModule}>
        {renderModule()}
      </BasicLayout>
    </ErrorBoundary>
  )
}

export default App
