import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import type { MenuAction } from '../shared/constants/menu'

const { readFile, writeFile } = fs.promises

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  const devPort = parseInt(process.env.VITE_DEV_PORT || '5173', 10)
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL(`http://localhost:${devPort}`)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

function sendMenuAction(action: MenuAction) {
  if (!mainWindow?.webContents) {
    console.error(`[Menu] Cannot trigger ${action}: mainWindow is null`)
    return
  }

  mainWindow.webContents.send(`menu:${action}`)
}

ipcMain.handle('dialog:openFile', async (_, options?: { filters?: { name: string; extensions: string[] }[] }) => {
  const defaultFilters = [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'tiff', 'tif', 'bmp'] }]
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: options?.filters || defaultFilters
  })
  if (result.canceled || !result.filePaths[0]) return null

  const filePath = result.filePaths[0]
  try {
    const buffer = await readFile(filePath)
    return { filePath, buffer: new Uint8Array(buffer) }
  } catch (err) {
    console.error('Failed to read file:', err)
    return null
  }
})

ipcMain.handle('dialog:saveFile', async (_, data: Uint8Array, options?: { extension?: string }) => {
  const ext = options?.extension || 'png'
  const filters =
    ext === 'jpeg'
      ? [{ name: 'JPEG Image', extensions: ['jpg', 'jpeg'] }]
      : ext === 'tiff'
        ? [{ name: 'TIFF Image', extensions: ['tif', 'tiff'] }]
        : [{ name: 'PNG Image', extensions: ['png'] }]

  const result = await dialog.showSaveDialog({ filters })
  if (result.canceled || !result.filePath) return false

  try {
    await writeFile(result.filePath, Buffer.from(data))
    return true
  } catch (err) {
    console.error('Failed to save file:', err)
    return false
  }
})

ipcMain.handle('fs:readFile', async (_, filePath: string) => {
  try {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path')
    }
    if (filePath.includes('..') || filePath.includes('~') || filePath.includes('$')) {
      throw new Error('Path traversal not allowed')
    }
    const buffer = await readFile(filePath)
    return new Uint8Array(buffer)
  } catch (err) {
    console.error('Failed to read file:', err)
    throw err
  }
})

ipcMain.handle('project:load', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'PrintBridge Project', extensions: ['pbp'] }]
  })
  if (result.canceled || !result.filePaths[0]) return null

  try {
    const content = await readFile(result.filePaths[0], 'utf-8')
    return JSON.parse(content)
  } catch (err) {
    console.error('Failed to load project:', err)
    return null
  }
})

ipcMain.handle('project:save', async (_, data: { version: string; imageBuffer?: Uint8Array; settings: Record<string, unknown> }) => {
  const result = await dialog.showSaveDialog({
    filters: [{ name: 'PrintBridge Project', extensions: ['pbp'] }]
  })
  if (result.canceled || !result.filePath) return false

  try {
    await writeFile(result.filePath, JSON.stringify(data, null, 2))
    return true
  } catch (err) {
    console.error('Failed to save project:', err)
    return false
  }
})

ipcMain.handle(
  'image:process',
  async (_, buffer: Uint8Array, _options: { colorMode?: string; resolution?: number; addBleed?: boolean }) => buffer
)

app.whenReady().then(() => {
  createWindow()

  const menu = Menu.buildFromTemplate([
    {
      label: '文件',
      submenu: [
        { label: '导入图像', accelerator: 'CmdOrCtrl+O', click: () => sendMenuAction('import-image') },
        { label: '导出图像', accelerator: 'CmdOrCtrl+S', click: () => sendMenuAction('export-image') },
        { label: '保存项目', accelerator: 'CmdOrCtrl+Shift+S', click: () => sendMenuAction('save-project') },
        { label: '打开项目', accelerator: 'CmdOrCtrl+Shift+O', click: () => sendMenuAction('load-project') },
        { type: 'separator' },
        { label: '退出', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: '视图',
      submenu: [
        { label: '重新加载', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.webContents.reload() },
        { label: '开发者工具', accelerator: 'F12', click: () => mainWindow?.webContents.toggleDevTools() }
      ]
    }
  ])

  Menu.setApplicationMenu(menu)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
