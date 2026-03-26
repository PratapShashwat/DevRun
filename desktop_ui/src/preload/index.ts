import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  analyzeRepo: (url) => ipcRenderer.invoke('run-python-orchestrator', url),
  saveFinalSpec: (specData) => ipcRenderer.invoke('save-final-spec', specData),
  deleteEnvironment: (projectName) => ipcRenderer.invoke('delete-environment', projectName),
  getSavedEnvironments: () => ipcRenderer.invoke('get-saved-environments'),
  modifyEnvironment: (data) => ipcRenderer.invoke('modify-env', data), 
  openIde: (projectName) => ipcRenderer.invoke('open-ide', projectName), 
  
  sendTerminalInput: (data) => ipcRenderer.send('terminal-input', data),
  onTerminalOutput: (callback) => {
    const listener = (event, data) => callback(data)
    ipcRenderer.on('terminal-output', listener)
    
    return () => ipcRenderer.removeListener('terminal-output', listener)
  },
  wakeContainer: (projectName) => ipcRenderer.invoke('wake-container', projectName)
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