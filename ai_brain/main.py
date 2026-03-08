import sys
import json
from fetcher import fetch_dependency_files_smart, parse_github_url
from orchestrator import generate_stack_spec

def main():
    print("===========================================")
    print(" StackStore: AI Orchestration Pipeline v1.0")
    print("===========================================\n")
    
    # NEW: Check if Electron passed a URL via command line
    if len(sys.argv) > 1:
        user_url = sys.argv[1].strip()
        print(f"[*] Received URL from Electron UI: {user_url}")
    else:
        user_url = input("Enter a GitHub Repository URL: ").strip()

    owner, repo = parse_github_url(user_url)
    if not owner or not repo:
        print("\n[!] Error: Invalid GitHub URL format.")
        # NEW: Print a clear error flag for Node.js to catch
        print("STACKSTORE_ERROR: Invalid URL") 
        sys.exit(1)

    # Step 1: Ingestion
    print(f"\n[1/2] Fetching repository data for {owner}/{repo}...")
    files = fetch_dependency_files_smart(owner, repo)

    if not files:
        print("\n[!] Error: No supported dependency files found. Aborting.")
        sys.exit(1)

    # Step 2: AI Orchestration
    print(f"\n[2/2] Analyzing dependencies and generating StackSpec...")
    stack_spec = generate_stack_spec(files, repo)

    if stack_spec:
        print(f"\n[SUCCESS] StackSpec generated perfectly!")
        print("\n--- Final JSON Output ---")
        print(json.dumps(stack_spec, indent=2))
    else:
        print("\n[!] Failed to generate StackSpec.")

if __name__ == "__main__":
    main()