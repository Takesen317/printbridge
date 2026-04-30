import { useRef, useCallback, useState, useEffect } from 'react'
import type { ImageDataTransfer, WorkerProcessOptions, WorkerResponse } from '../workers/image-processor.worker'

interface UseImageProcessorWorkerResult {
  processImage: (imageData: ImageData, options: WorkerProcessOptions) => Promise<ImageData>
  isProcessing: boolean
  error: string | null
}

// Cache for processed images - keyed by processing options
const processingCache = new Map<string, ImageData>()
const MAX_CACHE_SIZE = 4

function getCacheKey(options: WorkerProcessOptions): string {
  return `${options.lightSource}-${options.paperType}-${options.viewingDistance}-${options.resolution}`
}

/**
 * Hook to use the image processing worker
 * Returns a function to process images off the main thread
 * Includes caching to avoid redundant processing for the same options
 */
export function useImageProcessorWorker(): UseImageProcessorWorkerResult {
  const workerRef = useRef<Worker | null>(null)
  const mountedRef = useRef(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cleanup worker on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  // Initialize worker lazily
  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../workers/image-processor.worker.ts', import.meta.url),
        { type: 'module' }
      )
    }
    return workerRef.current
  }, [])

  const processImage = useCallback((imageData: ImageData, options: WorkerProcessOptions): Promise<ImageData> => {
    // Check cache first
    const cacheKey = getCacheKey(options)
    if (processingCache.has(cacheKey)) {
      // Return cached result
      return Promise.resolve(processingCache.get(cacheKey)!)
    }

    return new Promise((resolve, reject) => {
      setIsProcessing(true)
      setError(null)

      const worker = getWorker()

      // Make a copy of the data before sending to avoid detaching the original
      // The original ImageData may still be used by other parts of the app (e.g., canvas rendering)
      const transferData: ImageDataTransfer = {
        width: imageData.width,
        height: imageData.height,
        data: new Uint8ClampedArray(imageData.data),  // Copy here instead of transferring
        colorSpace: imageData.colorSpace || 'srgb'
      }

      const handleMessage = (e: MessageEvent<WorkerResponse>) => {
        if (!mountedRef.current) return

        const { type, result, error: err } = e.data

        if (type === 'result' && result) {
          worker.removeEventListener('message', handleMessage)
          worker.removeEventListener('error', handleError)
          // Convert back to ImageData with colorSpace
          const imageArray = new Uint8ClampedArray(result.data)
          const processedImageData = new ImageData(
            imageArray,
            result.width,
            result.height,
            { colorSpace: (result.colorSpace as PredefinedColorSpace) || 'srgb' }
          )

          // Store in cache
          if (processingCache.size >= MAX_CACHE_SIZE) {
            // Remove oldest entry (first in Map)
            const firstKey = processingCache.keys().next().value
            if (firstKey) processingCache.delete(firstKey)
          }
          processingCache.set(cacheKey, processedImageData)

          setIsProcessing(false)
          resolve(processedImageData)
        } else if (type === 'error') {
          worker.removeEventListener('message', handleMessage)
          worker.removeEventListener('error', handleError)
          setIsProcessing(false)
          setError(err || 'Processing failed')
          reject(new Error(err || 'Processing failed'))
        }
      }

      const handleError = (e: ErrorEvent) => {
        if (!mountedRef.current) return

        worker.removeEventListener('message', handleMessage)
        worker.removeEventListener('error', handleError)
        setIsProcessing(false)
        setError(e.message || 'Worker error')
        reject(new Error(e.message || 'Worker error'))
      }

      worker.addEventListener('message', handleMessage)
      worker.addEventListener('error', handleError)

      // Send data without transferring the buffer (original ImageData may still be in use)
      worker.postMessage({
        type: 'process',
        imageData: transferData,
        options
      })
    })
  }, [getWorker])

  return { processImage, isProcessing, error }
}