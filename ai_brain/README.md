# StackStore: AI Brain (AI Unlocked MVP)

## Overview
The `ai_brain` is the AI orchestration layer for the StackStore project. It acts as the bridge between raw source code and the core OS-level virtualization engine. [cite_start]By analyzing GitHub repositories, it automatically generates a standardized `StackSpec` JSON, eliminating manual configuration and solving "dependency hell"[cite: 13, 15].

## Architecture
This module specifically handles the following steps of the StackStore pipeline:
1. [cite_start]**Input Analysis:** Extracting key configuration files from a provided repository URL[cite: 40, 41].
2. [cite_start]**Spec Generation:** Parsing dependencies to output a precise `StackSpec` JSON[cite: 42, 43].

## Current Progress
* **Phase 1: Ingestion Engine (`fetcher.py`)** - Completed.
  * Uses the public GitHub API to fetch essential configuration files (`package.json`, `requirements.txt`, `pom.xml`) without downloading the entire repository codebase.
  * Implements graceful failure if no recognized configuration files are found.

## Next Steps (Future Coding Sessions)
1. [cite_start]**Formalize `StackSpec` Schema:** Define the exact JSON structure for filesystem roots, network ports, and environment variables[cite: 43].
2. **Prompt Engineering & Mocking:** Draft the LLM system prompts. Given current Azure access blocks, test the prompt logic using a local LLM or hardcoded mock functions.
3. **AI Orchestrator Layer:** Write the main service script that routes the fetched code to the LLM and formats the final JSON output.
4. [cite_start]**Electron/React UI Integration:** Connect this backend logic to the cross-platform desktop interface[cite: 50].

## Setup & Execution
```bash
# Activate the virtual environment
# Windows: venv\Scripts\activate
# Linux/Ubuntu: source venv/bin/activate

# Install required dependencies
pip install requests

# Run the ingestion script
python fetcher.py