# 📦 StackStore

**Instant, AI-Orchestrated Dev Environments.**
*Built for the Microsoft AI Unlocked Hackathon.*

---

### 📄 [View the 6-Slide Presentation Deck (PDF)](./Devil2b_Prototype_StackStore_Track6.pdf)

### 🎥 Watch the 3-Minute Demo Video:

[![StackStore Demo Video](https://github.com/user-attachments/assets/ff50c906-b2f2-4aed-a432-cb2020c09311)](https://drive.google.com/file/d/1hTrT524S0nv1San7o3FBNvr0lfgwvCS4/view?usp=drivesdk)

---

## 🛑 The Problem: Dependency Hell
Modern software development is plagued by environment configuration. Reviewing a simple GitHub repository often requires hours of installing specific Node versions, resolving Python virtual environment conflicts, and hunting down missing API keys. 

Existing solutions are insufficient:
* **Cloud VMs (like Codespaces)** are expensive, require persistent internet, and have high latency.
* **Manual Docker** requires developers to write and maintain complex `Dockerfile` and `docker-compose` configurations by hand.

## 💡 The Solution
StackStore completely eliminates local configuration by acting as an automated DevSecOps engineer. A developer simply pastes a repository URL into the StackStore client. 

Our AI Orchestrator utilizes the rapid reasoning capabilities of **Azure OpenAI (GPT-4o)** to analyze the codebase, infer the exact runtime requirements, catch missing secrets, and output a strict Docker configuration blueprint. Our Electron backend then takes over, communicating directly with the local Docker Desktop daemon to instantly build and boot a zero-dependency, securely isolated execution environment. 

Code stays on your local hard drive; the execution engine lives entirely in the sandbox.

## 🏗️ Architecture & Features
StackStore is built as a robust, decoupled DevSecOps ecosystem:

* **1. Desktop UI (React/Electron):** A sleek, native control panel featuring a stateless `xterm.js` terminal that pipes commands directly into the isolated Linux containers. 
* **2. AI Orchestrator (Python/Azure):** The intelligence layer. It reads the repository architecture and generates infrastructure-as-code.
* **3. Immutable Infrastructure:** Developers can modify their stack using natural language via the AI Chat. StackStore safely tears down the old container and boots a pristine, upgraded OS around their code without losing progress.
* **4. Smart Resource Management:** Features "Smart Resume" for instantly waking sleeping projects, and a Graceful Shutdown hook that safely pauses background containers to free up host RAM when the app is closed.

## 🚀 Getting Started

### Prerequisites
* **Docker Desktop** must be installed and running.
* **Node.js** (v18+)
* **Python** (3.10+)

### 1. Start the AI Orchestrator
```bash
cd ai_brain
python -m venv venv
source venv/bin/activate  # (Or .\venv\Scripts\activate on Windows)
pip install -r requirements.txt

# Create a .env file with your Azure OpenAI Keys (see ai_brain/README.md)
```

### 2. Launch the Desktop Client
```bash
cd desktop_ui
npm install
npm run dev
```

## 🔮 Future Roadmap
* **Azure AI Foundry Scaling:** Migrating the local Python orchestrator entirely to the Azure cloud to analyze massive, enterprise-scale monorepos asynchronously.
* **Enterprise Onboarding:** Allowing companies to distribute pre-warmed StackStore base images to instantly onboard new engineers on day one.
* **Multi-Container Topologies:** Upgrading the AI to generate complex `docker-compose.yml` networks for microservice architectures.