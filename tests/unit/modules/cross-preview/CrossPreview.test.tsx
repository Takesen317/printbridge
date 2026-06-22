import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CrossPreview from '../../../../src/renderer/modules/cross-preview/CrossPreview'
import CrossPreviewCanvas from '../../../../src/renderer/modules/cross-preview/components/CrossPreviewCanvas'
import CrossPreviewHeader from '../../../../src/renderer/modules/cross-preview/components/CrossPreviewHeader'
import { useLocaleStore } from '../../../../src/renderer/store/locale'
import { useProjectStore } from '../../../../src/renderer/store/project'

const { processImage, messageSuccess, messageError, workerState } = vi.hoisted(() => ({
  processImage: vi.fn(),
  messageSuccess: vi.fn(),
  messageError: vi.fn(),
  workerState: {
    isProcessing: false,
    error: null as string | null
  }
}))

vi.mock('antd', () => {
  const React = require('react') as typeof import('react')

  const Card = ({ children, ...props }: { children?: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => <section {...props}>{children}</section>

  const Tabs = ({
    items = [],
    ...props
  }: {
    items?: Array<{ key: string; label: string; children: React.ReactNode }>
  } & React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>
      {items.map((item) => (
        <section key={item.key}>
          <h2>{item.label}</h2>
          {item.children}
        </section>
      ))}
    </div>
  )

  return {
    Button: ({ children, onClick, disabled, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button type="button" onClick={onClick} disabled={disabled} {...props}>
        {children}
      </button>
    ),
    Card,
    Spin: () => <span>Spinner</span>,
    Tabs,
    message: {
      success: messageSuccess,
      error: messageError
    }
  }
})

vi.mock('@ant-design/icons', () => ({
  ReloadOutlined: () => null
}))

vi.mock('../../../../src/renderer/hooks/useImageProcessorWorker', () => ({
  useImageProcessorWorker: () => ({
    processImage,
    isProcessing: workerState.isProcessing,
    error: workerState.error
  })
}))

vi.mock('../../../../src/renderer/modules/cross-preview/components/OverlayView', () => ({
  default: () => <div>Overlay view</div>
}))

vi.mock('../../../../src/renderer/modules/cross-preview/components/SideBySideView', () => ({
  default: () => <div>Side by side view</div>
}))

vi.mock('../../../../src/renderer/modules/cross-preview/components/ViewingConditionsPanel', () => ({
  default: () => <div>Viewing conditions</div>
}))

vi.mock('../../../../src/renderer/modules/ai-assistant/AiAssistant', () => ({
  default: () => <div>AI assistant</div>
}))

describe('CrossPreview', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    processImage.mockReset()
    messageSuccess.mockReset()
    messageError.mockReset()
    workerState.isProcessing = false
    workerState.error = null
    useLocaleStore.setState({ locale: 'zh-CN' })

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
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders the localized preview header copy', async () => {
    await act(async () => {
      root.render(<CrossPreviewHeader />)
    })

    expect(container.textContent).toContain('Cross-Media Preview')
    expect(container.textContent).toContain('比较屏幕内容与模拟印刷输出在不同观察条件下的差异。')
  })

  it('renders the localized preview canvas controls', async () => {
    const image = new ImageData(new Uint8ClampedArray([0, 0, 0, 255]), 1, 1)

    await act(async () => {
      root.render(
        <CrossPreviewCanvas
          originalImageData={image}
          printPreviewData={image}
          onRefresh={vi.fn()}
          refreshDisabled={false}
        />
      )
    })

    expect(container.textContent).toContain('并排对比')
    expect(container.textContent).toContain('叠加对比')
    expect(container.textContent).toContain('刷新预览')
  })

  it('shows a processing notice while preview recomputation is pending', async () => {
    const image = new ImageData(new Uint8ClampedArray([0, 0, 0, 255]), 1, 1)
    workerState.isProcessing = true
    processImage.mockImplementation(() => new Promise(() => undefined))
    useProjectStore.setState({ originalImage: image, processedImage: image })

    await act(async () => {
      root.render(<CrossPreview />)
    })

    expect(container.textContent).toContain('正在更新预览')
  })

  it('renders the preview shell with supporting panels', async () => {
    const image = new ImageData(new Uint8ClampedArray([0, 0, 0, 255]), 1, 1)
    processImage.mockResolvedValue(image)
    useProjectStore.setState({ originalImage: image, processedImage: image })

    await act(async () => {
      root.render(<CrossPreview />)
    })

    expect(container.textContent).toContain('Cross-Media Preview')
    expect(container.textContent).toContain('Viewing conditions')
    expect(container.textContent).toContain('AI assistant')
  })

  it('disables refresh when no source image is available', async () => {
    await act(async () => {
      root.render(<CrossPreview />)
    })

    const refreshButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === '刷新预览')

    expect(refreshButton?.hasAttribute('disabled')).toBe(true)
    expect(processImage).not.toHaveBeenCalled()
  })

  it('refreshes the preview and shows a success message when the button is clicked', async () => {
    const image = new ImageData(new Uint8ClampedArray([0, 0, 0, 255]), 1, 1)
    const refreshedImage = new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1)
    processImage.mockResolvedValue(refreshedImage)
    useProjectStore.setState({ originalImage: image, processedImage: image })

    await act(async () => {
      root.render(<CrossPreview />)
    })

    const refreshButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === '刷新预览')
    const callsBeforeRefresh = processImage.mock.calls.length

    await act(async () => {
      refreshButton?.click()
    })

    expect(processImage.mock.calls.length).toBe(callsBeforeRefresh + 1)
    expect(useProjectStore.getState().processedImage).toBe(refreshedImage)
    expect(messageSuccess).toHaveBeenCalledWith('预览已刷新。')
  })

  it('falls back to the source image and avoids a success toast when refresh processing fails', async () => {
    const image = new ImageData(new Uint8ClampedArray([0, 0, 0, 255]), 1, 1)
    processImage.mockResolvedValueOnce(image).mockRejectedValueOnce(new Error('worker failed'))
    useProjectStore.setState({ originalImage: image, processedImage: image })

    await act(async () => {
      root.render(<CrossPreview />)
    })

    const refreshButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === '刷新预览')

    await act(async () => {
      refreshButton?.click()
    })

    expect(useProjectStore.getState().processedImage).toBe(image)
    expect(messageSuccess).not.toHaveBeenCalled()
    expect(messageError).toHaveBeenCalledWith('刷新预览失败。')
  })

  it('does not reprocess again just because processedImage changes after mount', async () => {
    const sourceImage = {
      width: 1,
      height: 1,
      data: new Uint8ClampedArray([0, 0, 0, 255])
    }
    const refreshedImage = new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1)
    processImage.mockResolvedValue(refreshedImage)
    useProjectStore.setState({ originalImage: sourceImage as unknown as ImageData, processedImage: null })

    await act(async () => {
      root.render(<CrossPreview />)
    })

    expect(processImage).toHaveBeenCalledTimes(1)
    expect(useProjectStore.getState().processedImage).toBe(refreshedImage)
  })
})
