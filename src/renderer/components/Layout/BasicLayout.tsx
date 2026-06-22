import { BulbFilled, BulbOutlined } from '@ant-design/icons'
import { Button, Layout, Menu, Select, Tooltip } from 'antd'
import { useState } from 'react'
import { useModuleConfig, type ModuleType } from '../../config/modules'
import { translate } from '../../constants/i18n'
import { useLocaleStore } from '../../store/locale'
import { useThemeStore } from '../../store/theme'

const { Sider, Content } = Layout

interface BasicLayoutProps {
  activeModule: ModuleType
  onModuleChange: (module: ModuleType) => void
  children: React.ReactNode
}

export default function BasicLayout({ activeModule, onModuleChange, children }: BasicLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { themeMode, toggleTheme } = useThemeStore()
  const { locale, setLocale } = useLocaleStore()
  const moduleConfig = useModuleConfig()

  const menuItems = moduleConfig.map(({ key, icon, label }) => ({
    key,
    icon,
    label
  }))

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        collapsedWidth={72}
        style={{
          background: 'var(--color-sidebar-bg)',
          borderRight: '1px solid var(--color-sidebar-hover)'
        }}
        trigger={
          <div
            style={{
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-sidebar-text-muted)',
              fontSize: '18px'
            }}
          >
            <span style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>{'>'}</span>
          </div>
        }
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 20px',
            borderBottom: '1px solid var(--color-sidebar-hover)',
            marginBottom: 16
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
            }}
          >
            PB
          </div>
          {!collapsed && (
            <span
              style={{
                marginLeft: 12,
                color: 'var(--color-sidebar-text)',
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: '-0.5px'
              }}
            >
              {translate(locale, 'layout.brand')}
            </span>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeModule]}
          items={menuItems}
          onClick={({ key }) => onModuleChange(key as ModuleType)}
          style={{
            background: 'transparent',
            border: 'none'
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 0,
            right: 0,
            padding: '0 16px',
            display: 'flex',
            flexDirection: collapsed ? 'column' : 'row',
            justifyContent: collapsed ? 'center' : 'space-between',
            alignItems: 'center',
            gap: 8
          }}
        >
          {!collapsed && (
            <Select
              size="small"
              value={locale}
              onChange={(value) => setLocale(value as 'zh-CN' | 'en-US')}
              options={[
                { label: translate(locale, 'layout.language.zh'), value: 'zh-CN' },
                { label: translate(locale, 'layout.language.en'), value: 'en-US' }
              ]}
              style={{ width: 96 }}
            />
          )}

          <Tooltip title={themeMode === 'light' ? translate(locale, 'layout.theme.switchToDark') : translate(locale, 'layout.theme.switchToLight')}>
            <Button
              type="text"
              icon={themeMode === 'light' ? <BulbOutlined /> : <BulbFilled />}
              onClick={toggleTheme}
              style={{
                color: 'var(--color-sidebar-text-muted)',
                fontSize: 18
              }}
            />
          </Tooltip>
        </div>
      </Sider>

      <Layout>
        <Content
          style={{
            padding: 24,
            background: 'var(--color-bg)',
            minHeight: '100vh'
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
