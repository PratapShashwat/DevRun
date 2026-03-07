import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  analyzeRepo: (url) => ipcRenderer.invoke('run-python-orchestrator', url),
  saveFinalSpec: (specData) => ipcRenderer.invoke('save-final-spec', specData) // NEW
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}

