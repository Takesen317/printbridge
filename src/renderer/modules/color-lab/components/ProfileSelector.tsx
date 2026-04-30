import { Select, Button, Tag, Space, message, Typography } from 'antd'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import { useColorStore } from '../../../store/color'
import { ICCProfile } from '../../../services/color-engine'
import { loadProfileFromFile } from '../../../services/icc-handler'

const { Text } = Typography

interface ProfileSelectorProps {
  profiles: ICCProfile[]
}

export default function ProfileSelector({ profiles }: ProfileSelectorProps) {
  const { activeProfile, setActiveProfile, customProfiles, addCustomProfile, removeCustomProfile } = useColorStore()

  const handleLoadCustomProfile = async () => {
    if (!window.electronAPI?.openFile) {
      message.error('Electron API 不可用')
      return
    }

    try {
      const result = await window.electronAPI.openFile({
        filters: [{ name: 'ICC Profile', extensions: ['icc', 'icm'] }]
      })

      if (result) {
        const loadedProfile = await loadProfileFromFile(result.filePath)
        if (loadedProfile) {
          addCustomProfile({
            name: loadedProfile.name,
            description: `自定义: ${loadedProfile.colorSpace}`,
            type: loadedProfile.type,
            isCustom: true
          })
          message.success(`已加载 ICC Profile: ${loadedProfile.name}`)
        } else {
          message.error('无法加载 ICC Profile 文件')
        }
      }
    } catch (err) {
      console.error('Failed to load ICC profile:', err)
      message.error('加载 ICC Profile 失败')
    }
  }

  const handleRemoveCustomProfile = (name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeCustomProfile(name)
    message.success(`已移除: ${name}`)
  }

  // Merge built-in and custom profiles
  const allProfiles = [...profiles, ...customProfiles.filter(cp => !profiles.some(p => p.name === cp.name))]

  return (
    <div>
      <Select
        placeholder="选择 ICC 配置"
        value={activeProfile?.name}
        onChange={(name) => {
          const profile = allProfiles.find(p => p.name === name)
          if (profile) setActiveProfile(profile)
        }}
        style={{ width: '100%' }}
        options={[
          {
            label: '内置 profiles',
            options: profiles.map(p => ({
              label: (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                    <Tag color="default" style={{ marginLeft: 8 }}>{p.type.toUpperCase()}</Tag>
                  </div>
                  <span style={{ color: '#999', fontSize: 12 }}>{p.description}</span>
                </div>
              ),
              value: p.name
            }))
          },
          ...(customProfiles.length > 0 ? [{
            label: '自定义 profiles',
            options: customProfiles.map(p => ({
              label: (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                    <Tag color="blue" style={{ marginLeft: 8 }}>自定义</Tag>
                    <Tag color="processing" style={{ marginLeft: 4 }}>{p.type.toUpperCase()}</Tag>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => handleRemoveCustomProfile(p.name, e)}
                  />
                </div>
              ),
              value: p.name
            }))
          }] : [])
        ]}
      />
      <div style={{ marginTop: 12 }}>
        <Button
          icon={<UploadOutlined />}
          onClick={handleLoadCustomProfile}
        >
          加载 ICC 文件
        </Button>
      </div>
      {activeProfile && (
        <div style={{ marginTop: 12 }}>
          <Space>
            <Text type="secondary">当前配置：</Text>
            <Tag color={activeProfile.type === 'rgb' ? 'green' : 'orange'}>
              {activeProfile.type.toUpperCase()}
            </Tag>
            {customProfiles.some(cp => cp.name === activeProfile.name) && (
              <Tag color="blue">自定义</Tag>
            )}
          </Space>
        </div>
      )}
    </div>
  )
}
