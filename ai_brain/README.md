# 🧠 StackStore: AI Orchestrator (`ai_brain`)

## Overview
The `ai_brain` is the intelligence layer of the StackStore microservice ecosystem. It acts as the bridge between raw source code and the core OS-level virtualization engine. By analyzing GitHub repositories using the Gemini LLM, it automatically infers runtime dependencies and generates a standardized `StackSpec` JSON blueprint, entirely eliminating manual configuration.

## How It Works
1. **Ingestion (`fetcher.py`):** Uses the public GitHub API to fetch essential configuration files (e.g., `package.json`, `requirements.txt`) without cloning the entire repository.
2. **Analysis (`main.py`):** Prompts the Gemini LLM to analyze the architecture, detect required environments, and catch missing secrets/API keys.
3. **Spec Generation:** Outputs a strict, standardized `StackSpec` JSON file to the `environments/` directory, which is then consumed by the C++ engine.

## Setup & Execution

### 1. Environment Variables
Create a `.env` file in the root of the `ai_brain` directory and add your Gemini API key:
\`\`\`env
GEMINI_API_KEY=your_api_key_here
\`\`\`

### 2. Installation
\`\`\`bash
# Create and activate the virtual environment
# Windows:
python -m venv venv
.\venv\Scripts\activate

# Linux/macOS:
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
\`\`\`

### 3. Manual Execution (For Testing)
Normally, this service is triggered automatically by the Electron desktop UI. To run it standalone:
\`\`\`bash
python main.py <github_repo_url>
\`\`\`