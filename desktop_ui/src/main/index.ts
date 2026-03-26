const { spawn, execSync } = require('child_process')
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let activeTerminalProcess = null;

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
    // WE WRAP THIS IN A PROMISE SO THE UI WAITS!
    return new Promise((resolve, reject) => {
      try {
        try {
          execSync('docker info', { stdio: 'ignore' })
        } catch (e) {
          return resolve({ success: false, error: "Docker is not running. Please start Docker Desktop." })
        }

        const projectName = stackSpec.project_name || 'unnamed_project'
        const safeProjectName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '')

        const envsDir = join(__dirname, '../../../environments')
        const projectDir = join(envsDir, safeProjectName)

        if (!fs.existsSync(envsDir)) fs.mkdirSync(envsDir)
        if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir)

        if (stackSpec.github_url) {
          console.log(`[GIT] Downloading source code from ${stackSpec.github_url}...`)
          try {
            execSync(`git clone ${stackSpec.github_url} .`, { cwd: projectDir })
            console.log(`[GIT] Source code cloned successfully!`)
          } catch (e) {
            console.error(`[GIT] Clone failed. It might already exist.`)
          }
        }

        const dockerfilePath = join(projectDir, 'Dockerfile')
        const devcontainerPath = join(projectDir, 'devcontainer.json')
        const specPath = join(projectDir, `${safeProjectName}_spec.json`)

        fs.writeFileSync(dockerfilePath, stackSpec.dockerfile || '# No Dockerfile generated')
        fs.writeFileSync(devcontainerPath, stackSpec.devcontainer || '{}')
        fs.writeFileSync(specPath, JSON.stringify(stackSpec, null, 2))

        console.log(`[DOCKER] Building lightweight delta image: devrun-${safeProjectName}...`)
        const buildProcess = spawn('docker', ['build', '-t', `devrun-${safeProjectName}`, '.'], { cwd: projectDir })

        buildProcess.stdout.on('data', (data) => console.log(`[DOCKER BUILD] ${data}`))
        buildProcess.stderr.on('data', (data) => console.error(`[DOCKER WARN/ERR] ${data}`))

        buildProcess.on('close', (code) => {
          if (code === 0) {
            console.log(`[DOCKER] Build complete! Booting secure sandbox...`)

            try {
              require('child_process').execSync(`docker rm -f devrun-${safeProjectName}`, { stdio: 'ignore' })
            } catch (e) {
              // Ignore if the container doesn't exist yet
            }

            const runProcess = spawn('docker', ['run', '-itd', '-P', '--name', `devrun-${safeProjectName}`, `devrun-${safeProjectName}`])

            runProcess.on('close', (runCode) => {
              if (runCode === 0) {
                console.log(`[DOCKER] Container is LIVE and waiting.`)
                resolve({ success: true, path: specPath })
              } else {
                resolve({ success: false, error: "Docker run failed to start the container." })
              }
            })
          } else {
            resolve({ success: false, error: `Docker build failed with exit code ${code}` })
          }
        })
      } catch (err) {
        console.error("Failed to save DevContainer spec:", err)
        resolve({ success: false, error: err.message })
      }
    })
  })

  ipcMain.handle('open-ide', async (event, projectName) => {
    try {
      const safeProjectName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '')
      const envsDir = join(__dirname, '../../../environments')
      const projectDir = join(envsDir, safeProjectName)

      console.log(`[IDE] Opening VS Code at: ${projectDir}`)

      // Use exec to run the standard VS Code command
      const { exec } = require('child_process')
      exec(`code "${projectDir}"`)

      return { success: true }
    } catch (err) {
      console.error("Failed to open IDE:", err)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('get-saved-environments', async () => {
    try {
      const envsDir = join(__dirname, '../../../environments')

      if (!fs.existsSync(envsDir)) {
        return { success: true, data: [] }
      }

      // Updated to search inside the new project subdirectories
      const dirs = fs.readdirSync(envsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

      const savedEnvs = []
      for (const dir of dirs) {
        const specPath = join(envsDir, dir, `${dir}_spec.json`)
        if (fs.existsSync(specPath)) {
          const rawData = fs.readFileSync(specPath, 'utf8')
          savedEnvs.push(JSON.parse(rawData))
        }
      }

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
      const safeProjectName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '')

      console.log(`[DOCKER] Destroying sandbox container: devrun-${safeProjectName}...`)
      // Force kill the container
      const rmProcess = spawn('docker', ['rm', '-f', `devrun-${safeProjectName}`])

      rmProcess.on('close', () => {
        console.log(`[DOCKER] Sandbox destroyed.`)
      })

      const envsDir = join(__dirname, '../../../environments')
      const projectDir = join(envsDir, safeProjectName)

      if (fs.existsSync(projectDir)) {
        fs.rmSync(projectDir, { recursive: true, force: true })
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

ipcMain.handle('modify-env', async (event, data) => {
  return new Promise((resolve, reject) => {
    let { specPath, projectName, userPrompt } = data

    if (!specPath || specPath === 'undefined') {
      if (!projectName) {
        return reject("Critical Error: React lost both the file path AND the project name.")
      }
      const safeProjectName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '')
      const envsDir = join(__dirname, '../../../environments')
      specPath = join(envsDir, safeProjectName, `${safeProjectName}_spec.json`)
    }

    const isWindows = process.platform === 'win32'
    const pythonExecutable = isWindows
      ? join(__dirname, '../../../ai_brain/venv/Scripts/python.exe')
      : join(__dirname, '../../../ai_brain/venv/bin/python')

    const pythonScript = join(__dirname, '../../../ai_brain/modifier.py')

    console.log(`[AI Modifier] Triggering for spec: ${specPath}`)
    console.log(`[AI Modifier] Prompt: ${userPrompt}`)

    const pythonProcess = spawn(pythonExecutable, [pythonScript, specPath, userPrompt])

    let jsonOutput = ''
    let errorLogs = ''

    pythonProcess.stdout.on('data', (data) => {
      jsonOutput += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      errorLogs += data.toString()
      console.error(`[Python Error]: ${data}`)
    })

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const cleanedJson = jsonOutput.replace(/```json/g, '').replace(/```/g, '').trim()
          const updatedJson = JSON.parse(cleanedJson)
          fs.writeFileSync(specPath, JSON.stringify(updatedJson, null, 2))
          resolve(updatedJson)
        } catch (e) {
          console.error("Failed to parse JSON. Raw output was:", jsonOutput)
          reject('Failed to parse updated JSON')
        }
      } else {
        console.error(`Modifier failed. Logs: ${errorLogs}`)
        reject('Modifier script failed. Check terminal for Python errors.')
      }
    })
  })
})

const { exec } = require('child_process');

ipcMain.on('terminal-input', (event, payload) => {
  const { projectName, command } = payload;
  const safeProjectName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const containerName = `devrun-${safeProjectName}`;

  console.log(`[TERMINAL EXEC] ${containerName} -> ${command}`);

  exec(`docker exec ${containerName} /bin/bash -c "${command}"`, (error, stdout, stderr) => {
    if (stdout) {
      event.sender.send('terminal-output', stdout);
    }
    if (stderr) {
      event.sender.send('terminal-output', stderr);
    }
    if (error && !stdout && !stderr) {
      event.sender.send('terminal-output', `Error: ${error.message}\n`);
    }
  });
});

ipcMain.handle('wake-container', async (event, projectName) => {
  try {
    const safeProjectName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '')
    // Tells Docker to start the sleeping container
    require('child_process').execSync(`docker start devrun-${safeProjectName}`)
    return { success: true }
  } catch (e) {
    console.error("Failed to wake container. It might have been manually deleted.")
    return { success: false }
  }
})

app.on('window-all-closed', () => {
  console.log('[SYSTEM] UI closed. Sleeping active DevRun sandboxes to free RAM...')
  try {
    const { execSync } = require('child_process')
    const output = execSync('docker ps -q --filter "status=running" --filter "name=devrun-"').toString().trim()

    if (output) {
      const containers = output.split(/\r?\n/)
      containers.forEach(id => {
        const cleanId = id.trim()
        if (cleanId) {
          console.log(`[DOCKER] Putting container ${cleanId} to sleep...`)
          execSync(`docker stop ${cleanId}`)
        }
      })
      console.log('[SYSTEM] All DevRun containers successfully paused. RAM freed.')
    }
  } catch (error) {
    console.log('[SYSTEM] No active containers to pause.')
  }

  if (process.platform !== 'darwin') {
    app.quit()
  }
})