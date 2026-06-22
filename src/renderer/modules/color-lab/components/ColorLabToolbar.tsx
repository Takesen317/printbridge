import { CameraOutlined, DownloadOutlined, ExperimentOutlined, FolderOpenOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Segmented, Select } from 'antd'
import { translate } from '../../../constants/i18n'
import type { ProjectViewMode } from '../../../services/project-serializer'
import { useLocaleStore } from '../../../store/locale'
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
  const locale = useLocaleStore((state) => state.locale)

  return (
    <div style={{ marginBottom: 20 }}>
      <Segmented
        value={viewMode}
        onChange={(value) => onViewModeChange(value as ProjectViewMode)}
        options={[
          { label: translate(locale, 'colorLab.views.import'), value: 'import', icon: <UploadOutlined /> },
          { label: translate(locale, 'colorLab.views.analyze'), value: 'analyze', icon: <CameraOutlined /> },
          { label: translate(locale, 'colorLab.views.preview'), value: 'preview', icon: <ExperimentOutlined /> }
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
  const locale = useLocaleStore((state) => state.locale)

  return (
    <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 8 }}>
      <Button icon={<DownloadOutlined />} onClick={onExport} style={{ borderRadius: 'var(--radius-md)' }}>
        {translate(locale, 'colorLab.export')}
      </Button>
      <Select
        value={exportSource}
        onChange={onExportSourceChange}
        style={{ width: 110 }}
        options={[
          { label: translate(locale, 'colorLab.exportSource.original'), value: 'original' },
          { label: translate(locale, 'colorLab.exportSource.preview'), value: 'preview' }
        ]}
      />
      <Select
        value={exportFormat}
        onChange={onExportFormatChange}
        style={{ width: 90 }}
        options={[
          { label: translate(locale, 'colorLab.exportFormat.png'), value: 'png' },
          { label: translate(locale, 'colorLab.exportFormat.jpeg'), value: 'jpeg' },
          { label: translate(locale, 'colorLab.exportFormat.tiff'), value: 'tiff' }
        ]}
      />
      <Button icon={<UploadOutlined />} onClick={onReplace} style={{ borderRadius: 'var(--radius-md)' }}>
        {translate(locale, 'colorLab.replace')}
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
  const locale = useLocaleStore((state) => state.locale)

  return (
    <>
      <div style={{ marginBottom: 16, color: 'var(--color-text-secondary)' }}>
        {translate(locale, 'colorLab.project.current', { projectName })}
      </div>
      <ProfileSelector profiles={profiles} />
      <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button type="primary" onClick={onAnalyze} style={{ borderRadius: 'var(--radius-md)' }}>
          {translate(locale, 'colorLab.project.runAnalysis')}
        </Button>
        {viewMode === 'analyze' && (
          <Button onClick={() => onViewModeChange('preview')} style={{ borderRadius: 'var(--radius-md)' }}>
            {translate(locale, 'colorLab.project.openSoftProof')}
          </Button>
        )}
        <Button icon={<SaveOutlined />} onClick={onSaveProject}>
          {translate(locale, 'colorLab.project.save')}
        </Button>
        <Button icon={<FolderOpenOutlined />} onClick={onOpenProject}>
          {translate(locale, 'colorLab.project.open')}
        </Button>
      </div>
    </>
  )
}
