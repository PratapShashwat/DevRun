# 📂 PROJECT: STACKSTORE (Internal Codename: DevRun)
**Version:** 1.0 (Feb 2026)
**Vision:** A decentralized "App Store" for raw source code. We bridge the gap between GitHub repositories and end-user execution using containerization and AI.

---

## 1. Core Philosophy
* **"No Install" Policy:** Users never manually install dependencies (Python, Node, etc.). Everything runs in isolated containers.
* **"Zero Trash" Policy:** When an app is closed/deleted, its container is destroyed. No residual files remain on the Host OS.
* **AI-First Onboarding:** We do not force developers to write config files. We use LLMs to generate them automatically.

---

## 2. Architecture & Tech Stack

### A. The Tech Stack
* **Frontend (GUI):** Electron.js + React (Provides the "App Store" look and feel).
* **Backend (Orchestrator):** Node.js (Manages the Docker daemon and file system).
* **Runtime Engine:** Docker (The "Virtual Machine" layer).
* **Intelligence:** Gemini/OpenAI API (Analyzes code to generate run configs).
* **Storage:** GitHub (We fetch code directly; we do not host it).

### B. The Workflow
1.  **User** pastes a GitHub Link.
2.  **App** clones the repo to a temporary cache.
3.  **Analyzer (AI)** scans the files -> Generates stackstore.yaml (Installation steps).
4.  **Runner (OS)** builds a Docker Image based on the YAML.
5.  **Execution:** App runs in the container; Output is streamed to the Electron GUI.

---

## 3. The "Manifest" Protocol (stackstore.yaml)
Every app is defined by this file. If it doesn't exist, AI creates it.

    name: "Youtube-Downloader-CLI"
    base_image: "python:3.9-slim"
    install_commands:
      - "pip install -r requirements.txt"
    run_command: "python main.py"
    permissions:
      network: true
      filesystem: false

---

## 4. Implementation Roadmap

### Phase 1: The Engine (The "Runner")
* **Goal:** A Node.js script that can take a local folder and run it inside Docker.
* **Key Tech:** child_process, docker run, stdout streaming.

### Phase 2: The Intelligence (The "Analyzer")
* **Goal:** A script that fetches a GitHub repo, reads the file structure, and prompts the LLM to write the stackstore.yaml.

### Phase 3: The GUI (The "Store")
* **Goal:** Electron app to browse apps, visualize the "Installing..." logs, and handle the "Run" button.

### Phase 4: The Startup (Cloud & Scale)
* **Goal:** Monetization.
* **Features:**
    * **Cloud Run:** Run heavy apps on our server for a fee.
    * **Donation System:** Crypto/UPI tipping for devs.
    * **User Accounts:** MongoDB for saving preferences.

---

## 5. Constraints & Risks
* **Dependency:** User MUST have Docker installed (for MVP).
* **OS Differences:** Handling Windows (\) vs Mac/Linux (/) paths in Node.js.
* **Security:** Preventing containers from mounting sensitive host directories.