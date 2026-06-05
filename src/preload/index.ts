import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI, ProcessOptions, ProjectData } from '../shared/types/electron'
import { MENU_ACTIONS, type MenuAction } from '../shared/constants/menu'

const api: ElectronAPI = {
  openFile: (options) =>
    ipcRenderer.invoke('dialog:openFile', options).catch((err) => {
      console.error('openFile failed:', err)
      return null
    }),
  saveFile: (data: Uint8Array, options?: { extension?: string }) =>
    ipcRenderer.invoke('dialog:saveFile', data, options).catch((err) => {
      console.error('saveFile failed:', err)
      return false
    }),
  readFile: (filePath: string) =>
    ipcRenderer.invoke('fs:readFile', filePath).catch((err) => {
      console.error('readFile failed:', err)
      throw err
    }),
  processImage: (buffer: Uint8Array, options: ProcessOptions) =>
    ipcRenderer.invoke('image:process', buffer, options).catch((err) => {
      console.error('processImage failed:', err)
      throw err
    }),
  loadProject: () =>
    ipcRenderer.invoke('project:load').catch((err) => {
      console.error('loadProject failed:', err)
      return null
    }),
  saveProject: (data: ProjectData) =>
    ipcRenderer.invoke('project:save', data).catch((err) => {
      console.error('saveProject failed:', err)
      return false
    }),
  onMenuAction: (callback: (action: MenuAction) => void) => {
    const listeners = MENU_ACTIONS.map((action) => {
      const channel = `menu:${action}`
      const handler = () => callback(action)
      ipcRenderer.on(channel, handler)
      return { channel, handler }
    })

    return () => {
      for (const { channel, handler } of listeners) {
        ipcRenderer.removeListener(channel, handler)
      }
    }
  }
}

contextBridge.exposeInMainWorld('electronAPI', api)
