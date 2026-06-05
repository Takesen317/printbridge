import { Component, type ReactNode, useEffect, useState } from 'react'
import BasicLayout from './components/Layout/BasicLayout'
import { MODULE_CONFIG, type ModuleType } from './config/modules'
import CrossPreview from './modules/cross-preview/CrossPreview'
import KnowledgeHub from './modules/knowledge-hub/KnowledgeHub'
import PrintAdapter from './modules/print-adapter/PrintAdapter'
import ColorLab from './modules/color-lab/ColorLab'
import type { MenuAction } from '../shared/constants/menu'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

const COLOR_LAB_ACTIONS: MenuAction[] = ['import-image', 'export-image']

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
  const safeActiveModule = MODULE_CONFIG.some((module) => module.key === activeModule) ? activeModule : 'color-lab'

  const emitMenuAction = (action: MenuAction) => {
    window.dispatchEvent(new CustomEvent<MenuAction>('printbridge:menu-action', { detail: action }))
  }

  useEffect(() => {
    if (!window.electronAPI?.onMenuAction) return

    return window.electronAPI.onMenuAction((action) => {
      if (COLOR_LAB_ACTIONS.includes(action)) {
        setActiveModule('color-lab')
      }
      emitMenuAction(action)
    })
  }, [])

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'o' && !event.shiftKey) {
        event.preventDefault()
        setActiveModule('color-lab')
        emitMenuAction('import-image')
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's' && !event.shiftKey) {
        event.preventDefault()
        setActiveModule('color-lab')
        emitMenuAction('export-image')
      }

      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 's') {
        event.preventDefault()
        emitMenuAction('save-project')
      }

      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'o') {
        event.preventDefault()
        emitMenuAction('load-project')
      }

      if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '4') {
        event.preventDefault()
        const index = parseInt(event.key, 10) - 1
        if (MODULE_CONFIG[index]) {
          setActiveModule(MODULE_CONFIG[index].key)
        }
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  const renderModule = () => {
    switch (safeActiveModule) {
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
      <BasicLayout activeModule={safeActiveModule} onModuleChange={setActiveModule}>
        {renderModule()}
      </BasicLayout>
    </ErrorBoundary>
  )
}

export default App
