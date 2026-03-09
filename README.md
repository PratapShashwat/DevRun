# 📦 StackStore

**AI-Generated, OS-Level Development Environments.**
*Built for the Microsoft AI Unlocked Hackathon.*

---

### 📄 [View the 6-Slide Presentation Deck (PDF)](./Devil2b_Prototype_StackStore_Track6.pdf)

### 🎥 Watch the 3-Minute Demo Video:

[![StackStore Demo Video](https://github.com/user-attachments/assets/ff50c906-b2f2-4aed-a432-cb2020c09311)](https://drive.google.com/file/d/1hTrT524S0nv1San7o3FBNvr0lfgwvCS4/view?usp=drivesdk)

---

## 🛑 The Problem: Dependency Hell
Modern software development is plagued by environment configuration. Reviewing a simple GitHub repository often requires hours of installing specific Node versions, resolving Python virtual environment conflicts, and hunting down missing API keys. 

Existing solutions are insufficient:
* **Virtual Machines** are too heavy, slow to boot, and expensive to host.
* **Docker** requires manual creation and maintenance of `Dockerfile` configurations.

## 💡 The Solution
StackStore completely eliminates local configuration. A developer simply pastes a repository URL into the StackStore client. Our AI Orchestrator utilizes the rapid reasoning capabilities of the **Gemini LLM** to analyze the codebase, infer the exact runtime requirements, catch missing secrets, and output a strict `StackSpec` JSON blueprint. 

Our custom C++ Engine then parses this blueprint, utilizing native Linux kernel system calls to instantly carve out a zero-cost, localized, and securely isolated execution environment.

## 🏗️ Decoupled Microservice Architecture
StackStore is not a monolithic script; it is built as a robust, decoupled ecosystem:

1. **Desktop UI (React/Electron):** A sleek, cross-platform control panel for developers to input repositories, manage missing environment variables securely, and track environment states.
2. **AI Orchestrator (Python):** The intelligence layer. It reads the repository architecture and generates a standardized `StackSpec` blueprint defining the required OS state.
3. **Core Engine (C++):** A headless, high-performance binary. It reads the JSON blueprint and executes raw Linux `clone()` syscalls to isolate Process IDs (`CLONE_NEWPID`), Mount points (`CLONE_NEWNS`), and Hostnames (`CLONE_NEWUTS`), locking the code into a secure chroot-style sandbox.

## 🚀 Getting Started

### 1. Build the Virtualization Engine (Linux Required)
Because the engine interacts directly with the Linux Kernel to create isolated namespaces, it must be compiled and run on a native Linux system (like Ubuntu).

\`\`\`bash
cd engine
make
\`\`\`

### 2. Start the AI Orchestrator
\`\`\`bash
cd ai_brain
python3 -m venv venv
source venv/bin/activate  # (Or .\venv\Scripts\activate on Windows)
pip install -r requirements.txt
python main.py
\`\`\`

### 3. Launch the Desktop Client
\`\`\`bash
cd desktop_ui
npm install
npm run dev
\`\`\`

## 🔮 Future Roadmap: Scaling the StackSpec
* **Micro-sandboxes:** Upgrading the C++ engine to parse a single `StackSpec` and split full-stack services into multiple isolated, networked namespaces without altering the core AI logic.
* **Natural Language Environment Editing:** Allowing developers to update and modify their active environment configurations instantly using simple voice commands.
* **Windows/WSL Native Support:** Expanding the C++ engine to hook into the Windows Subsystem for Linux (WSL2) API for native cross-platform execution.
* **Hardware Passthrough:** Enabling PCIe passthrough so sandboxed repositories can leverage the host machine's GPUs for local model training.
