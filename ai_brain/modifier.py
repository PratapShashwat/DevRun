import sys
import json
from dotenv import load_dotenv

load_dotenv()

from google import genai
from google.genai import types

def modify_stack_spec(spec_path, user_prompt):
    try:
        with open(spec_path, 'r') as f:
            current_spec = f.read()
    except Exception as e:
        print(f"STACKSTORE_ERROR: Could not read spec file: {e}", file=sys.stderr)
        sys.exit(1)
        
    client = genai.Client()
    
    prompt = f"""
    You are a DevSecOps systems architect. 
    Here is the current StackSpec JSON blueprint for a local environment:
    {current_spec}
    
    The developer has requested the following change: "{user_prompt}"
    
    Return the entirely updated JSON blueprint integrating this change. 
    Ensure the structure remains perfectly intact.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash', 
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
        print(cleaned_text)
        sys.exit(0)
        
    except Exception as e:
        print(f"STACKSTORE_ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("STACKSTORE_ERROR: Missing arguments", file=sys.stderr)
        sys.exit(1)
        
    spec_path = sys.argv[1]
    user_prompt = sys.argv[2]
    modify_stack_spec(spec_path, user_prompt)