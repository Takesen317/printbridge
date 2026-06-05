import { DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, message, Select, Space, Tag, Typography } from 'antd'
import type { ICCProfile } from '../../../services/color-engine'
import { loadProfileFromFile } from '../../../services/icc-handler'
import { useColorStore } from '../../../store/color'

const { Text } = Typography

interface ProfileSelectorProps {
  profiles: ICCProfile[]
}

export default function ProfileSelector({ profiles }: ProfileSelectorProps) {
  const { activeProfile, setActiveProfile, customProfiles, addCustomProfile, removeCustomProfile } = useColorStore()

  const handleLoadCustomProfile = async () => {
    if (!window.electronAPI?.openFile) {
      message.error('Electron file access is not available.')
      return
    }

    try {
      const result = await window.electronAPI.openFile({
        filters: [{ name: 'ICC Profile', extensions: ['icc', 'icm'] }]
      })

      if (!result) return

      const loadedProfile = await loadProfileFromFile(result.filePath)
      if (!loadedProfile) {
        message.error('Unable to load the selected ICC profile.')
        return
      }

      addCustomProfile({
        name: loadedProfile.name,
        description: `Custom ${loadedProfile.colorSpace} profile`,
        type: loadedProfile.type,
        isCustom: true
      })
      message.success(`Loaded ICC profile: ${loadedProfile.name}`)
    } catch (err) {
      console.error('Failed to load ICC profile:', err)
      message.error('Failed to load the ICC profile.')
    }
  }

  const handleRemoveCustomProfile = (name: string, event: React.MouseEvent) => {
    event.stopPropagation()
    removeCustomProfile(name)
    message.success(`Removed profile: ${name}`)
  }

  const allProfiles = [...profiles, ...customProfiles.filter((profile) => !profiles.some((builtin) => builtin.name === profile.name))]

  return (
    <div>
      <Select
        placeholder="Choose an ICC profile"
        value={activeProfile?.name}
        onChange={(name) => {
          const profile = allProfiles.find((item) => item.name === name)
          if (profile) setActiveProfile(profile)
        }}
        style={{ width: '100%' }}
        options={[
          {
            label: 'Built-in profiles',
            options: profiles.map((profile) => ({
              label: (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>{profile.name}</span>
                    <Tag color="default" style={{ marginLeft: 8 }}>
                      {profile.type.toUpperCase()}
                    </Tag>
                  </div>
                  <span style={{ color: '#999', fontSize: 12 }}>{profile.description}</span>
                </div>
              ),
              value: profile.name
            }))
          },
          ...(customProfiles.length > 0
            ? [
                {
                  label: 'Custom profiles',
                  options: customProfiles.map((profile) => ({
                    label: (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: 500 }}>{profile.name}</span>
                          <Tag color="blue" style={{ marginLeft: 8 }}>
                            Custom
                          </Tag>
                          <Tag color="processing" style={{ marginLeft: 4 }}>
                            {profile.type.toUpperCase()}
                          </Tag>
                        </div>
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(event) => handleRemoveCustomProfile(profile.name, event)}
                        />
                      </div>
                    ),
                    value: profile.name
                  }))
                }
              ]
            : [])
        ]}
      />

      <div style={{ marginTop: 12 }}>
        <Button icon={<UploadOutlined />} onClick={handleLoadCustomProfile}>
          Load ICC profile
        </Button>
      </div>

      {activeProfile && (
        <div style={{ marginTop: 12 }}>
          <Space>
            <Text type="secondary">Current profile:</Text>
            <Tag color={activeProfile.type === 'rgb' ? 'green' : 'orange'}>{activeProfile.type.toUpperCase()}</Tag>
            {customProfiles.some((profile) => profile.name === activeProfile.name) && <Tag color="blue">Custom</Tag>}
          </Space>
        </div>
      )}
    </div>
  )
}
