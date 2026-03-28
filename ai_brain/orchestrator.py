import os
import json
from dotenv import load_dotenv

load_dotenv()

from google import genai
from google.genai import types

SYSTEM_PROMPT = """
You are the AI Orchestrator for StackStore, an intelligent DevSecOps tool.
Your task is to analyze raw configuration files from a GitHub repository and generate the necessary configuration to spin up a secure, containerized development environment.

RULES:
1. You must output ONLY valid JSON. No markdown formatting outside of the JSON structure.
2. The Dockerfile MUST start exactly with: FROM stackstore-base:latest
3. Base Environment Constraints: The base image contains core languages (Python, Node, Java) but lacks OS-level utilities (curl, unzip, git) and modern package managers (uv, bun, pnpm, poetry). 
4. Installation Mandate: You MUST install required OS utilities first (e.g., 'RUN apt-get update && apt-get install -y curl unzip'). THEN install required package managers. For pip, use the override flag ('RUN pip install uv --break-system-packages'). For Bun, remember its installer requires 'unzip'. 
5. Extract any required environment variables or API keys from the code/README and list them in 'missing_env_keys'.

OUTPUT SCHEMA:
{s
  "project_name": "string",
  "dockerfile": "string (the raw Dockerfile content)",
  "devcontainer": "string (the raw devcontainer.json content)",
  "missing_env_keys": ["string"]
}
"""

def generate_stack_spec(extracted_files_dict, repo_name):
    context_str = json.dumps(extracted_files_dict, indent=2)

    user_content = f"Repository Name: {repo_name}\n\nExtracted Files:\n{context_str}\n\nGenerate the DevSecOps JSON payload."

    print("[*] Routing request to Gemini API (google-genai)...")
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("STACKSTORE_ERROR: GEMINI_API_KEY not found in .env file.")
        return None

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=user_content,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
            )
        )
        
        cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
        stack_spec_dict = json.loads(cleaned_text)
        
        return stack_spec_dict
        
    except Exception as e:
        print(f"STACKSTORE_ERROR: LLM Generation failed: {str(e)}")
        return None