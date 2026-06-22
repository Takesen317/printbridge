import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ColorLab from '../../../../src/renderer/modules/color-lab/ColorLab'
import { useColorStore } from '../../../../src/renderer/store/color'
import { useLocaleStore } from '../../../../src/renderer/store/locale'
import { useProjectStore } from '../../../../src/renderer/store/project'

vi.mock('antd', () => {
  const React = require('react') as typeof import('react')
  const Card = ({ children, title, ...props }: { children?: React.ReactNode; title?: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => (
    <section {...props}>
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  )

  return {
    Button: ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button type="button" onClick={onClick} {...props}>
        {children}
      </button>
    ),
    Card,
    Segmented: ({ options = [], value, onChange, ...props }: { options?: Array<{ label: string; value: string }>; value?: string; onChange?: (value: string) => void } & React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>
        {options.map((option) => (
          <button key={option.value} type="button" data-selected={String(value === option.value)} onClick={() => onChange?.(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
    ),
    Select: ({ options = [], value, onChange, ...props }: { options?: Array<{ label: string; value: string }>; value?: string; onChange?: (value: string) => void } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
      <select value={value} onChange={(event) => onChange?.(event.target.value)} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ),
    message: { success: vi.fn(), error: vi.fn(), warning: vi.fn() }
  }
})

vi.mock('@ant-design/icons', () => ({
  CameraOutlined: () => null,
  DownloadOutlined: () => null,
  ExperimentOutlined: () => null,
  FolderOpenOutlined: () => null,
  SaveOutlined: () => null,
  UploadOutlined: () => null
}))

vi.mock('utif', () => ({ encodeImage: vi.fn(() => new ArrayBuffer(0)) }))
vi.mock('../../../../src/renderer/components/Skeleton', () => ({ ImageSkeleton: ({ height }: { height: number }) => <div>Skeleton {height}</div> }))
vi.mock('../../../../src/renderer/modules/color-lab/components/ColorAnalyzer', () => ({ default: () => <div>Color analyzer</div> }))
vi.mock('../../../../src/renderer/modules/color-lab/components/SoftProofPreview', () => ({
  default: ({ originalImageData, proofImageData }: { originalImageData?: { width: number; height: number } | null; proofImageData?: { width: number; height: number } | null }) => (
    <div>
      Soft proof preview
      <span data-testid="soft-proof-original">{originalImageData ? `${originalImageData.width}x${originalImageData.height}` : 'empty'}</span>
      <span data-testid="soft-proof-proof">{proofImageData ? `${proofImageData.width}x${proofImageData.height}` : 'empty'}</span>
    </div>
  )
}))
vi.mock('../../../../src/renderer/modules/color-lab/components/ProfileSelector', () => ({ default: () => <div>Profile selector</div> }))
vi.mock('../../../../src/renderer/services/color-engine', () => ({
  analyzeColor: vi.fn(() => ({ representativeColor: { r: 0, g: 0, b: 0 } })),
  getAvailableProfiles: vi.fn(() => [{ name: 'sRGB', description: 'Standard RGB color space', type: 'rgb' }]),
  initializeColorEngine: vi.fn(() => Promise.resolve({ success: true }))
}))

describe('ColorLab', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    useColorStore.setState({
      activeProfile: null,
      analysis: null,
      softProofEnabled: false,
      warningThreshold: 3,
      customProfiles: [],
      iccEngineStatus: 'ready',
      setActiveProfile: useColorStore.getState().setActiveProfile,
      setAnalysis: useColorStore.getState().setAnalysis,
      toggleSoftProof: useColorStore.getState().toggleSoftProof,
      setWarningThreshold: useColorStore.getState().setWarningThreshold,
      addCustomProfile: useColorStore.getState().addCustomProfile,
      removeCustomProfile: useColorStore.getState().removeCustomProfile,
      setIccEngineStatus: useColorStore.getState().setIccEngineStatus
    })

    useProjectStore.setState({
      projectName: 'Demo project',
      originalImage: null,
      processedImage: null,
      processingOptions: {
        colorMode: 'rgb',
        resolution: 300,
        paperType: 'coated',
        simulateViewingConditions: true,
        viewingDistance: 250,
        lightSource: 'D50'
      },
      aiAdvice: null,
      lastViewMode: 'import',
      exportFormat: 'png',
      exportSource: 'original',
      aiTargetUse: 'general',
      setProjectName: useProjectStore.getState().setProjectName,
      setOriginalImage: useProjectStore.getState().setOriginalImage,
      setProcessedImage: useProjectStore.getState().setProcessedImage,
      updateProcessingOptions: useProjectStore.getState().updateProcessingOptions,
      setAiAdvice: useProjectStore.getState().setAiAdvice,
      setLastViewMode: useProjectStore.getState().setLastViewMode,
      setExportFormat: useProjectStore.getState().setExportFormat,
      setExportSource: useProjectStore.getState().setExportSource,
      setAiTargetUse: useProjectStore.getState().setAiTargetUse,
      resetProject: useProjectStore.getState().resetProject,
      saveProjectToFile: vi.fn().mockResolvedValue(true),
      loadProjectFromFile: vi.fn().mockResolvedValue(true)
    })

    useLocaleStore.setState({ locale: 'zh-CN' })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders Chinese import-state workflow controls by default', async () => {
    await act(async () => {
      root.render(<ColorLab />)
    })

    expect(container.textContent).toContain('颜色实验室')
    expect(container.textContent).toContain('导入图像，检查代表性色彩偏移，并预览软打样风格输出。')
    expect(container.textContent).toContain('导入')
    expect(container.textContent).toContain('分析')
    expect(container.textContent).toContain('预览')
    expect(container.textContent).toContain('导入图像')
    expect(container.textContent).toContain('选择文件')
    expect(container.textContent).toContain('中文')
    expect(container.textContent).toContain('English')
  })

  it('renders imported image data into the preview workflow when an image is present', async () => {
    const image = new ImageData(new Uint8ClampedArray(4), 1, 1)
    useProjectStore.setState({ originalImage: image, processedImage: image })

    await act(async () => {
      root.render(<ColorLab />)
    })

    expect(container.textContent).toContain('当前项目：Demo project')
    expect(container.textContent).toContain('开始分析')
    expect(container.textContent).toContain('保存项目')
    expect(container.textContent).toContain('打开项目')
    expect(container.textContent).toContain('导出')
    expect(container.textContent).toContain('替换图像')
    expect(container.querySelector('[data-testid="soft-proof-original"]')?.textContent).toBe('1x1')
    expect(container.querySelector('[data-testid="soft-proof-proof"]')?.textContent).toBe('1x1')
  })

  it('renders immediately when the store contains serialized image data', async () => {
    const serializedImage = {
      width: 2,
      height: 1,
      data: new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 255, 255])
    }

    useProjectStore.setState({
      originalImage: serializedImage as unknown as ImageData,
      processedImage: serializedImage as unknown as ImageData
    })

    await act(async () => {
      root.render(<ColorLab />)
    })

    expect(container.textContent).toContain('当前项目：Demo project')
    expect(container.querySelector('[data-testid="soft-proof-original"]')?.textContent).toBe('2x1')
    expect(container.querySelector('[data-testid="soft-proof-proof"]')?.textContent).toBe('2x1')
  })

  it('scales the main preview canvas to fill the available preview area for small images', async () => {
    const image = new ImageData(new Uint8ClampedArray(4 * 4).fill(255), 2, 2)
    useProjectStore.setState({ originalImage: image, processedImage: image })

    await act(async () => {
      root.render(<ColorLab />)
    })

    const mainPreviewCanvas = container.querySelector('canvas')

    expect(mainPreviewCanvas).not.toBeNull()
    expect(mainPreviewCanvas?.style.width).toBe('100%')
    expect(mainPreviewCanvas?.style.height).toBe('auto')
  })

  it('switches visible workflow copy to English after toggling locale', async () => {
    const image = new ImageData(new Uint8ClampedArray(4), 1, 1)
    useProjectStore.setState({ originalImage: image, processedImage: image })
    useLocaleStore.setState({ locale: 'en-US' })

    await act(async () => {
      root.render(<ColorLab />)
    })

    expect(container.textContent).toContain('Import an image, inspect representative color shifts, and preview a soft-proof style output.')
    expect(container.textContent).toContain('Current project: Demo project')
    expect(container.textContent).toContain('Run analysis')
    expect(container.textContent).toContain('Replace')
  })

  it('wires project workflow actions through the rendered container', async () => {
    const image = new ImageData(new Uint8ClampedArray(4), 1, 1)
    const saveProjectToFile = vi.fn().mockResolvedValue(true)
    const loadProjectFromFile = vi.fn().mockResolvedValue(true)

    useProjectStore.setState({
      originalImage: image,
      processedImage: image,
      saveProjectToFile,
      loadProjectFromFile
    })

    await act(async () => {
      root.render(<ColorLab />)
    })

    const buttons = Array.from(container.querySelectorAll('button'))

    await act(async () => {
      buttons.find((button) => button.textContent === '保存项目')?.click()
      buttons.find((button) => button.textContent === '打开项目')?.click()
    })

    expect(saveProjectToFile).toHaveBeenCalledTimes(1)
    expect(loadProjectFromFile).toHaveBeenCalledTimes(1)
  })
})
