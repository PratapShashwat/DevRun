import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { spawn } from 'child_process'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Create the browser window.
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

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  ipcMain.handle('save-final-spec', async (event, stackSpec) => {
    try {
      // 1. Grab the project name from the JSON
      const projectName = stackSpec.project_name || 'unnamed_project'
      
      // 2. Create a dedicated 'environments' folder in our root directory
      const envsDir = join(__dirname, '../../../environments')
      if (!fs.existsSync(envsDir)) {
        fs.mkdirSync(envsDir) // Automatically create the folder if it doesn't exist
      }
      
      // 3. Save the file cleanly using the project name
      const outputPath = join(envsDir, `${projectName}_spec.json`)
      fs.writeFileSync(outputPath, JSON.stringify(stackSpec, null, 2))
      
      console.log(`[SUCCESS] Blueprint saved to: ${outputPath}`)
      
      // THE FINAL HANDOFF TO YOUR C++ ENGINE (You will uncomment this later!)
      /*
      console.log(`Spawning StackStore Engine...`)
      const enginePath = join(__dirname, '../../../engine/stackstore-engine.exe')
      const engineProcess = spawn(enginePath, ['--config', outputPath])
      */

      return { success: true, path: outputPath }
    } catch (err) {
      console.error("Failed to save final spec:", err)
      return { success: false, error: err.message }
    }
  })

  // ADD THIS BLOCK: The listener that executes your Python script
  ipcMain.handle('run-python-orchestrator', async (event, githubUrl) => {
    return new Promise((resolve, reject) => {
      console.log(`Starting AI analysis for: ${githubUrl}`)

      // Path to your python environment and main.py
      // Check if the host OS is Windows ('win32') or Linux/Mac ('darwin' / 'linux')
      const isWindows = process.platform === 'win32'

      const pythonExecutable = isWindows
        ? join(__dirname, '../../../ai_brain/venv/Scripts/python.exe')
        : join(__dirname, '../../../ai_brain/venv/bin/python')

const pythonScript = join(__dirname, '../../../ai_brain/main.py')

      const pythonProcess = spawn(pythonExecutable, [pythonScript, githubUrl])

      let logs = ''

      pythonProcess.stdout.on('data', (data) => {
        logs += data.toString()
        console.log(`Python: ${data}`) // See Python print statements in your Node terminal
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

        // BULLETPROOF FIX: Just grab the JSON directly from the Python terminal output!
        try {
          if (logs.includes('--- Final JSON Output ---')) {
            // Split the logs at our marker and grab everything after it
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
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
