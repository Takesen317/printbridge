// src/main/index.ts
import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron'
import fs from 'fs'
import path from 'path'

// 使用 fs.promises 进行异步文件操作
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

  // 开发模式使用当前Vite端口
  const DEV_PORT = parseInt(process.env.VITE_DEV_PORT || '5173')
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL(`http://localhost:${DEV_PORT}`)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// IPC 处理器 - 文件操作
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
  const filters = ext === 'jpeg'
    ? [{ name: 'JPEG Image', extensions: ['jpg', 'jpeg'] }]
    : [{ name: 'PNG Image', extensions: ['png'] }]

  const result = await dialog.showSaveDialog({
    filters
  })
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
    // Security: validate filePath to prevent path traversal attacks
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path')
    }
    // Reject path traversal sequences
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

// Options reserved for future CPU-intensive processing in main process
ipcMain.handle('image:process', async (_, buffer: Uint8Array, _options: { colorMode?: string; resolution?: number; addBleed?: boolean }) => {
  // 当前图像处理在 renderer 端进行，这里预留 CPU 密集型处理的扩展点
  return buffer
})

app.whenReady().then(() => {
  createWindow()

  // Menu action handler - uses executeJavaScript to directly trigger DOM actions
// This is more reliable than IPC for menu actions as it runs directly in renderer context
function triggerMenuAction(action: string) {
  console.log(`[Menu] Triggering action: ${action}`)
  if (mainWindow?.webContents) {
    const script = action === 'import'
      ? `document.getElementById('file-input')?.click()`
      : `document.getElementById('export-button')?.click()`
    mainWindow.webContents.executeJavaScript(script)
      .then(() => console.log(`[Menu] Successfully triggered ${action}`))
      .catch((err) => console.error(`[Menu] Failed to trigger ${action}:`, err))
  } else {
    console.error(`[Menu] Cannot trigger ${action}: mainWindow is null`)
  }
}

const menu = Menu.buildFromTemplate([
    { label: '文件', submenu: [
      { label: '导入图像', accelerator: 'CmdOrCtrl+O', click: () => triggerMenuAction('import') },
      { label: '导出', accelerator: 'CmdOrCtrl+S', click: () => triggerMenuAction('export') },
      { type: 'separator' },
      { label: '退出', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
    ]},
    { label: '视图', submenu: [
      { label: '重新加载', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.webContents.reload() },
      { label: '开发者工具', accelerator: 'F12', click: () => mainWindow?.webContents.toggleDevTools() }
    ]}
  ])
  Menu.setApplicationMenu(menu)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
