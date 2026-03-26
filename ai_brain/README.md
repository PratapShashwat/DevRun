# 🧠 StackStore: AI Orchestrator (`ai_brain`)

## Overview
The `ai_brain` is the intelligence layer of the StackStore microservice ecosystem. Powered by **Azure OpenAI**, it acts as the bridge between raw source code and the core virtualization engine. By analyzing GitHub repositories, it automatically infers runtime dependencies, exposes required network ports, and generates standardized infrastructure-as-code, entirely eliminating manual configuration.

## How It Works
1. **Ingestion (`fetcher.py`):** Uses the public GitHub API to fetch essential configuration files (e.g., `package.json`, `requirements.txt`) without cloning the entire repository.
2. **Analysis (`main.py`):** Prompts the Azure OpenAI model (GPT-4o) to analyze the architecture, detect required environments, and catch missing secrets/API keys.
3. **Spec Generation:** Outputs a strict JSON blueprint containing a custom `Dockerfile` and setup instructions, which is then consumed by the Electron backend to build the environment.

## Setup & Execution

### 1. Environment Variables
Create a `.env` file in the root of the `ai_brain` directory and add your credentials:
```env
GEMINI_API_KEY=your_api_key_here
```
or
```env
AZURE_OPENAI_API_KEY=your_key_1_here
AZURE_OPENAI_ENDPOINT=[https://your-resource-name.openai.azure.com/](https://your-resource-name.openai.azure.com/)
AZURE_OPENAI_DEPLOYMENT_NAME=your_model_deployment_name
```

### 2. Installation

# Create and activate the virtual environment
# Windows:
python -m venv venv
.\venv\Scripts\activate

# Linux/macOS:
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
