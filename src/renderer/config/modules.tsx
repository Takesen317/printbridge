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
import { translate } from '../constants/i18n'
import { useLocaleStore } from '../store/locale'

export type ModuleType = 'color-lab' | 'cross-preview' | 'print-adapter' | 'knowledge-hub'

export interface ModuleConfig {
  key: ModuleType
  icon: React.ReactNode
  label: string
}

export function useModuleConfig(): ModuleConfig[] {
  const locale = useLocaleStore((state) => state.locale)

  return [
    { key: 'color-lab', icon: <BgColorsOutlined />, label: translate(locale, 'module.colorLab') },
    { key: 'cross-preview', icon: <ExpandOutlined />, label: translate(locale, 'module.crossPreview') },
    { key: 'print-adapter', icon: <PrinterOutlined />, label: translate(locale, 'module.printAdapter') },
    { key: 'knowledge-hub', icon: <BookOutlined />, label: translate(locale, 'module.knowledgeHub') }
  ]
}
