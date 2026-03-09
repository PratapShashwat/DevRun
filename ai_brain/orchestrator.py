import os
import json
from dotenv import load_dotenv

load_dotenv()

from google import genai
from google.genai import types
# from openai import AzureOpenAI
SCHEMA_NAME = "schema_v1.json"
def load_schema_template():
    """Loads the schema template from the external JSON file."""
    schema_path = os.path.join(os.path.dirname(__file__), SCHEMA_NAME)
    try:
        with open(schema_path, "r") as f:
            return f.read()
    except FileNotFoundError:
        print("[!] Error: schema_v1.json file not found.")
        return "{}"

SYSTEM_PROMPT = f"""
You are the AI Orchestrator for StackStore, a local desktop application that creates instant, isolated development environments using OS-level virtualization.
Your task is to analyze raw configuration files from a GitHub repository and generate a strict "StackSpec" JSON configuration.

RULES:
1. You must output ONLY valid JSON. No markdown formatting, no explanations.
2. The JSON must strictly adhere to the StackSpec v1.0 schema provided below.
3. If a service requires compilation before running (e.g., React, C++), populate the "commands.build" field. Otherwise, set it to null.
4. If you detect references to API keys in a README or .env, add them to "env_vars" but set their value to "<REQUIRED_USER_INPUT>".

SCHEMA TO FOLLOW:
{load_schema_template()}
"""

def generate_stack_spec(extracted_files_dict, repo_name):
    user_content = f"Repository Name: {repo_name}\n\nExtracted Files:\n"
    for filename, content in extracted_files_dict.items():
        user_content += f"--- {filename} ---\n{content}\n\n"
        
    user_content += "Generate the StackSpec JSON matching the v1.0 schema:"

    # ==========================================
    # CURRENT ENGINE: GOOGLE GEMINI (gemini-2.5-flash)
    # ==========================================
    print("[*] Routing request to Gemini API (google-genai)...")
    
    if not os.environ.get("GEMINI_API_KEY"):
        print("[!] Error: GEMINI_API_KEY not found in .env file.")
        return None
        
    try:
        client = genai.Client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_content,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json"
            )
        )
        raw_json = response.text
        
    except Exception as e:
        print(f"[!] API Call Failed: {e}")
        return None

    # ==========================================
    # FUTURE ENGINE: AZURE OPENAI   (GPT-4o) 
    # ==========================================
    """
    print("[*] Routing request to Azure OpenAI (GPT-4o)...")
    try:
        client = AzureOpenAI(
            azure_endpoint=os.environ.get("AZURE_OPENAI_ENDPOINT"),
            api_key=os.environ.get("AZURE_OPENAI_API_KEY"),
            api_version="2024-02-15-preview"
        )
        
        response = client.chat.completions.create(
            model="gpt-4o", # Replace with your actual deployment name
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content}
            ],
            response_format={ "type": "json_object" }
        )
        raw_json = response.choices[0].message.content
        
    except Exception as e:
        print(f"[!] Azure API Call Failed: {e}")
        return None
    """

    try:
        return json.loads(raw_json)
    except json.JSONDecodeError as e:
        print(f"[!] Error: LLM did not return valid JSON. {e}")
        print("Raw Output:\n", raw_json)
        return None