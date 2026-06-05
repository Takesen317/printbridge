import { describe, it, expect } from 'vitest'
// Note: Not using renderHook since @testing-library/react is not installed
// Testing hook behavior directly without React Testing Library
import { useImageProcessorWorker } from '../../../src/renderer/hooks/useImageProcessorWorker'

// We can verify the hook exports correctly by checking module resolution
describe('useImageProcessorWorker', () => {
  it('module exports useImageProcessorWorker function', () => {
    // Verify the module can be imported (will fail at build time if export doesn't exist)
    expect(typeof useImageProcessorWorker).toBe('function')
  })
})