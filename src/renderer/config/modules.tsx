/**
 * Module configuration
 * Used by BasicLayout and App to define available modules
 */
import {
  BgColorsOutlined,
  ExpandOutlined,
  PrinterOutlined,
  BookOutlined
} from '@ant-design/icons'

export type ModuleType = 'color-lab' | 'cross-preview' | 'print-adapter' | 'knowledge-hub'

export interface ModuleConfig {
  key: ModuleType
  icon: React.ReactNode
  label: string
}

export const MODULE_CONFIG: ModuleConfig[] = [
  { key: 'color-lab', icon: <BgColorsOutlined />, label: '色彩管理' },
  { key: 'cross-preview', icon: <ExpandOutlined />, label: '跨媒介预览' },
  { key: 'print-adapter', icon: <PrinterOutlined />, label: '智能印刷适配' },
  { key: 'knowledge-hub', icon: <BookOutlined />, label: '学习资源库' }
]
