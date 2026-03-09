const { spawn } = require('child_process')
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  ipcMain.handle('save-final-spec', async (event, stackSpec) => {
    try {
      const projectName = stackSpec.project_name || 'unnamed_project'
      const envsDir = join(__dirname, '../../../environments')
      if (!fs.existsSync(envsDir)) fs.mkdirSync(envsDir)
      
      const outputPath = join(envsDir, `${projectName}_spec.json`)
      fs.writeFileSync(outputPath, JSON.stringify(stackSpec, null, 2))
      
      console.log(`[SUCCESS] Blueprint saved to: ${outputPath}`)
      
      const enginePath = join(__dirname, '../../../engine/stackstore-engine')
      
      console.log(`Spawning C++ Engine via pkexec...`)
      const engineProcess = spawn('pkexec', [enginePath, outputPath])

      engineProcess.stdout.on('data', (data) => console.log(`[C++] ${data}`))
      engineProcess.stderr.on('data', (data) => console.error(`[C++ ERROR] ${data}`))
      // ----------------------------

      return { success: true, path: outputPath }
    } catch (err) {
      console.error("Failed to save final spec:", err)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('get-saved-environments', async () => {
    try {
      const envsDir = join(__dirname, '../../../environments')
      
      if (!fs.existsSync(envsDir)) {
        return { success: true, data: [] }
      }

      const files = fs.readdirSync(envsDir).filter(f => f.endsWith('_spec.json'))
      
      const savedEnvs = files.map(file => {
        const rawData = fs.readFileSync(join(envsDir, file), 'utf8')
        return JSON.parse(rawData)
      })

      return { success: true, data: savedEnvs }
    } catch (err) {
      console.error("Failed to read saved environments:", err)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('run-python-orchestrator', async (event, githubUrl) => {
    return new Promise((resolve, reject) => {
      console.log(`Starting AI analysis for: ${githubUrl}`)

      const isWindows = process.platform === 'win32'

      const pythonExecutable = isWindows
        ? join(__dirname, '../../../ai_brain/venv/Scripts/python.exe')
        : join(__dirname, '../../../ai_brain/venv/bin/python')

const pythonScript = join(__dirname, '../../../ai_brain/main.py')

      const pythonProcess = spawn(pythonExecutable, [pythonScript, githubUrl])

      let logs = ''

      pythonProcess.stdout.on('data', (data) => {
        logs += data.toString()
        console.log(`Python: ${data}`)
      })

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`)
      })

      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`)
        
        if (code !== 0 || logs.includes('STACKSTORE_ERROR')) {
          resolve({ success: false, error: 'Failed to analyze repository.' })
          return
        }

        try {
          if (logs.includes('--- Final JSON Output ---')) {
            const jsonString = logs.split('--- Final JSON Output ---')[1].trim()
            const stackSpec = JSON.parse(jsonString)
            
            resolve({ success: true, data: stackSpec })
          } else {
            resolve({ success: false, error: 'AI did not output the final JSON marker.' })
          }
        } catch (err) {
          console.error("Parse error on string:", logs)
          resolve({ success: false, error: 'Failed to parse the AI output.' })
        }
      })
    })
  })

  ipcMain.handle('delete-environment', async (event, projectName) => {
    try {
      const envsDir = join(__dirname, '../../../environments')
      const jsonFile = join(envsDir, `${projectName}_spec.json`)
      
      if (fs.existsSync(jsonFile)) {
        fs.unlinkSync(jsonFile)
      }

      const rootFsFolder = join(envsDir, projectName)
      if (fs.existsSync(rootFsFolder)) {
        fs.rmSync(rootFsFolder, { recursive: true, force: true }) 
      }
      
      console.log(`[CLEANUP] Successfully deleted environment data for: ${projectName}`)
      return { success: true }
    } catch (err) {
      console.error("Failed to delete environment:", err)
      return { success: false, error: err.message }
    }
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

