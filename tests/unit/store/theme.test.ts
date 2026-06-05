import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from '../../../src/renderer/store/theme'

describe('theme store', () => {
  beforeEach(() => {
    // Reset to initial state
    useThemeStore.setState({
      themeMode: 'light',
      setThemeMode: useThemeStore.getState().setThemeMode,
      toggleTheme: useThemeStore.getState().toggleTheme
    })
  })

  it('has correct initial state', () => {
    const state = useThemeStore.getState()
    expect(state.themeMode).toBe('light')
  })

  it('setThemeMode changes theme to dark', () => {
    useThemeStore.getState().setThemeMode('dark')
    expect(useThemeStore.getState().themeMode).toBe('dark')
  })

  it('setThemeMode changes theme to light', () => {
    useThemeStore.getState().setThemeMode('dark')
    useThemeStore.getState().setThemeMode('light')
    expect(useThemeStore.getState().themeMode).toBe('light')
  })

  it('toggleTheme switches from light to dark', () => {
    const store = useThemeStore.getState()
    expect(store.themeMode).toBe('light')

    store.toggleTheme()
    expect(useThemeStore.getState().themeMode).toBe('dark')
  })

  it('toggleTheme switches from dark to light', () => {
    const store = useThemeStore.getState()
    store.setThemeMode('dark')
    store.toggleTheme()
    expect(useThemeStore.getState().themeMode).toBe('light')
  })

  it('multiple toggleTheme calls alternate values', () => {
    const store = useThemeStore.getState()

    // light -> dark
    store.toggleTheme()
    expect(useThemeStore.getState().themeMode).toBe('dark')

    // dark -> light
    store.toggleTheme()
    expect(useThemeStore.getState().themeMode).toBe('light')

    // light -> dark
    store.toggleTheme()
    expect(useThemeStore.getState().themeMode).toBe('dark')
  })

  it('setThemeMode can be called multiple times', () => {
    const store = useThemeStore.getState()

    store.setThemeMode('dark')
    expect(useThemeStore.getState().themeMode).toBe('dark')

    store.setThemeMode('light')
    expect(useThemeStore.getState().themeMode).toBe('light')

    store.setThemeMode('dark')
    expect(useThemeStore.getState().themeMode).toBe('dark')
  })
})