import { useEffect, useRef, useCallback } from 'react'
import { toRealImageData } from '../utils/image-utils'

/**
 * Hook to draw ImageData on a canvas
 * Handles canvas setup, sizing, and rendering
 *
 * @param canvasRef - Ref to the canvas element
 * @param imageData - ImageData to draw (or serialized ImageData)
 * @param options - Optional rendering options
 */
export function useCanvasImage(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  imageData: ImageData | unknown,
  options?: {
    /** Whether to use instance check instead of toRealImageData (for deserialized data) */
    useInstanceCheck?: boolean
  }
) {
  const { useInstanceCheck = false } = options || {}

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let imgData: ImageData | null = null

    if (useInstanceCheck) {
      // For potentially deserialized data from store
      imgData = imageData instanceof ImageData ? imageData : null
    } else {
      // Normal case: convert from store format
      imgData = toRealImageData(imageData as ImageData)
    }

    if (!imgData) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = imgData.width
    canvas.height = imgData.height
    ctx.putImageData(imgData, 0, 0)
  }, [canvasRef, imageData, useInstanceCheck])

  useEffect(() => {
    draw()
  }, [draw])
}

/**
 * Hook to draw ImageData on a canvas with manual trigger
 * Returns a ref and a draw function for manual control
 *
 * @param imageData - ImageData to draw (or serialized ImageData)
 */
export function useCanvasImageManual(imageData: ImageData | unknown) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const imgData = toRealImageData(imageData as ImageData)
    if (!imgData) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = imgData.width
    canvas.height = imgData.height
    ctx.putImageData(imgData, 0, 0)
  }, [imageData])

  useEffect(() => {
    draw()
  }, [draw])

  return { canvasRef, redraw: draw }
}
