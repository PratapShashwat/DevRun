import requests
import re
import sys

def parse_github_url(url):
    """Extracts the owner and repo name."""
    match = re.search(r"github\.com/([^/]+)/([^/]+)", url)
    if match:
        repo_name = match.group(2).replace(".git", "")
        return match.group(1), repo_name
    return None, None

def get_default_branch(owner, repo):
    """Fetches the repository metadata to find if it uses 'main' or 'master'."""
    api_url = f"https://api.github.com/repos/{owner}/{repo}"
    response = requests.get(api_url)
    if response.status_code == 200:
        return response.json().get("default_branch", "main")
    return None

def fetch_dependency_files_smart(owner, repo):
    """Uses the Git Trees API to find target files anywhere in the repo."""
    target_files = {"package.json", "requirements.txt", "pom.xml", "README.md"}
    extracted_data = {}
    
    branch = get_default_branch(owner, repo)
    if not branch:
        print(f"[-] Could not access repository {owner}/{repo}. Check if it's public.")
        return extracted_data

    print(f"\nScanning repository tree for {owner}/{repo} on branch '{branch}'...")
    
    # The '?recursive=1' parameter gets the whole tree in one go
    tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
    response = requests.get(tree_url)
    
    if response.status_code != 200:
        print("[-] Failed to fetch repository tree.")
        return extracted_data

    tree = response.json().get("tree", [])
    
    # Filter for our target files, ignoring files deeply buried in things like node_modules
    matched_paths = [
        item["path"] for item in tree 
        if item["type"] == "blob" and 
        item["path"].split("/")[-1] in target_files and
        "node_modules" not in item["path"] and 
        "venv" not in item["path"]
    ]

    if not matched_paths:
        return extracted_data

    print(f"[+] Found {len(matched_paths)} relevant configuration file(s). Fetching contents...\n")

    # Fetch the actual text content for each matched file
    headers = {"Accept": "application/vnd.github.v3.raw"}
    for path in matched_paths:
        raw_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
        file_resp = requests.get(raw_url, headers=headers)
        if file_resp.status_code == 200:
            print(f"  -> Downloaded: {path}")
            # We store it with its full path (e.g., 'backend/requirements.txt') so the AI knows its context
            extracted_data[path] = file_resp.text

    return extracted_data

if __name__ == "__main__":
    print("=== StackStore: AI Ingestion Engine v1.1 (Smart Scan) ===")
    user_url = input("Enter a GitHub Repository URL: ").strip()
    
    owner, repo = parse_github_url(user_url)
    
    if not owner or not repo:
        print("\n[!] Error: Invalid GitHub URL format.")
        sys.exit(1)
        
    files = fetch_dependency_files_smart(owner, repo)
    
    if not files:
        print("\n[!] Error: No supported dependency files or README found.")
        print("[!] Cannot guarantee a stable environment. Aborting.")
        sys.exit(1)
        
    print(f"\n[SUCCESS] Extracted {len(files)} files. Ready for AI orchestration.")