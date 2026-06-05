import { CameraOutlined, DownloadOutlined, ExperimentOutlined, FolderOpenOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Segmented, Select } from 'antd'
import type { ProjectViewMode } from '../../../services/project-serializer'
import ProfileSelector from './ProfileSelector'

interface NavigationToolbarProps {
  onViewModeChange: (value: ProjectViewMode) => void
  viewMode: ProjectViewMode
}

interface OverlayToolbarProps {
  exportFormat: 'png' | 'jpeg' | 'tiff'
  exportSource: 'original' | 'preview'
  onExport: () => void
  onExportFormatChange: (value: 'png' | 'jpeg' | 'tiff') => void
  onExportSourceChange: (value: 'original' | 'preview') => void
  onReplace: () => void
}

interface ProjectToolbarProps {
  onAnalyze: () => void
  onOpenProject: () => void
  onSaveProject: () => void
  onViewModeChange: (value: ProjectViewMode) => void
  profiles: Parameters<typeof ProfileSelector>[0]['profiles']
  projectName: string
  viewMode: ProjectViewMode
}

export function ColorLabNavigationToolbar({ onViewModeChange, viewMode }: NavigationToolbarProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Segmented
        value={viewMode}
        onChange={(value) => onViewModeChange(value as ProjectViewMode)}
        options={[
          { label: 'Import', value: 'import', icon: <UploadOutlined /> },
          { label: 'Analyze', value: 'analyze', icon: <CameraOutlined /> },
          { label: 'Preview', value: 'preview', icon: <ExperimentOutlined /> }
        ]}
        block
      />
    </div>
  )
}

export function ColorLabOverlayToolbar({
  exportFormat,
  exportSource,
  onExport,
  onExportFormatChange,
  onExportSourceChange,
  onReplace
}: OverlayToolbarProps) {
  return (
    <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 8 }}>
      <Button icon={<DownloadOutlined />} onClick={onExport} style={{ borderRadius: 'var(--radius-md)' }}>
        Export
      </Button>
      <Select
        value={exportSource}
        onChange={onExportSourceChange}
        style={{ width: 110 }}
        options={[
          { label: 'Original', value: 'original' },
          { label: 'Preview', value: 'preview' }
        ]}
      />
      <Select
        value={exportFormat}
        onChange={onExportFormatChange}
        style={{ width: 90 }}
        options={[
          { label: 'PNG', value: 'png' },
          { label: 'JPEG', value: 'jpeg' },
          { label: 'TIFF', value: 'tiff' }
        ]}
      />
      <Button icon={<UploadOutlined />} onClick={onReplace} style={{ borderRadius: 'var(--radius-md)' }}>
        Replace
      </Button>
    </div>
  )
}

export function ColorLabProjectToolbar({
  onAnalyze,
  onOpenProject,
  onSaveProject,
  onViewModeChange,
  profiles,
  projectName,
  viewMode
}: ProjectToolbarProps) {
  return (
    <>
      <div style={{ marginBottom: 16, color: 'var(--color-text-secondary)' }}>Current project: {projectName}</div>
      <ProfileSelector profiles={profiles} />
      <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button type="primary" onClick={onAnalyze} style={{ borderRadius: 'var(--radius-md)' }}>
          Run analysis
        </Button>
        {viewMode === 'analyze' && (
          <Button onClick={() => onViewModeChange('preview')} style={{ borderRadius: 'var(--radius-md)' }}>
            Open soft proof
          </Button>
        )}
        <Button icon={<SaveOutlined />} onClick={onSaveProject}>
          Save project
        </Button>
        <Button icon={<FolderOpenOutlined />} onClick={onOpenProject}>
          Open project
        </Button>
      </div>
    </>
  )
}
