# 🖥️ StackStore: Desktop UI (`desktop_ui`)

## Overview
The Desktop UI is the user-facing control panel for StackStore, built with React and Electron. It provides a sleek, cross-platform interface for developers to input GitHub repositories, manage missing environment variables securely, and trigger the AI orchestration pipeline.

## Architecture
* **Frontend (React):** Handles state management, UI rendering, and capturing user inputs for missing secrets.
* **Backend (Electron/Node.js):** Acts as the local bridge. It uses IPC (Inter-Process Communication) and `child_process` to seamlessly trigger the Python `ai_brain` and pass the resulting JSON blueprint to the C++ `engine`.

## Setup & Execution

\`\`\`bash
# Install dependencies
npm install

# Start the development server and open the app
npm run dev
\`\`\`