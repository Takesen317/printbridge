import { useCallback, useRef, useEffect } from 'react'

/**
 * Hook that debounces a callback function
 * @param fn - The function to debounce
 * @param delay - Delay in milliseconds
 */
export function useDebounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): T {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        fn(...args)
      }, delay)
    },
    [fn, delay]
  ) as T
}
