# 🖥️ StackStore: Desktop UI (`desktop_ui`)

## Overview
The Desktop UI is the user-facing control panel for StackStore, built with React, Vite, and Electron. It provides a sleek, cross-platform interface for developers to input GitHub repositories, manage missing environment variables securely, and interact directly with their isolated Linux sandboxes.

## Architecture
* **Frontend (React & xterm.js):** Handles state management, UI rendering, and provides a fully functional, stateless terminal emulator.
* **Backend (Electron/Node.js):** Acts as the local orchestration bridge. It uses IPC (Inter-Process Communication) to trigger the Python `ai_brain`, parses the resulting JSON blueprint, and uses native `child_process` hooks to command the local Docker Desktop daemon.
* **Resource Management:** Includes automated hooks to pause running Docker containers when the window is closed, ensuring zero memory leaks on the host machine.

## Setup & Execution

```bash
# Install dependencies
npm install

# Start the development server and open the app
npm run dev
```