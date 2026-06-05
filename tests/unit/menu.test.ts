import { describe, expect, it } from 'vitest'
import { MENU_ACTIONS } from '../../src/shared/constants/menu'

describe('menu constants', () => {
  it('defines the supported menu action contract', () => {
    expect(MENU_ACTIONS).toEqual(['import-image', 'export-image', 'save-project', 'load-project'])
  })
})
