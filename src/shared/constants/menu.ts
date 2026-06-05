export const MENU_ACTIONS = ['import-image', 'export-image', 'save-project', 'load-project'] as const

export type MenuAction = typeof MENU_ACTIONS[number]
