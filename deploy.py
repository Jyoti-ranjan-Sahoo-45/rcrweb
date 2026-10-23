import os
import paramiko

HOST = "217.21.84.194"
PORT = 65002
USER = "u529002218"
PASS = "Jyoti45@jrs"
REMOTE_BASE = "/home/u529002218/domains/rcrgroups.shop/public_html"
LOCAL_BASE = r"c:\jyoti\rcrweb"

EXCLUDE = {
    "hostingerssh.md", "deploy.py", "setup_db.py", "APIKey.csv", 
    ".vercelignore", "vercel.json", ".gitignore"
}
EXCLUDE_DIRS = {".git", ".vercel", ".agents", "loanapp"}

def deploy():
    print(f"Connecting to {HOST}:{PORT} as {USER}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=15)
    sftp = ssh.open_sftp()
    print("SSH & SFTP Connected successfully.")

    # Ensure remote base directory exists
    try:
        sftp.stat(REMOTE_BASE)
    except FileNotFoundError:
        print(f"Creating remote base directory: {REMOTE_BASE}")
        sftp.mkdir(REMOTE_BASE)

    # Remove default.php if present
    try:
        sftp.remove(REMOTE_BASE + "/default.php")
        print("Removed placeholder default.php")
    except Exception:
        pass

    total_files = 0
    # Walk local directory
    for root, dirs, files in os.walk(LOCAL_BASE):
        # Filter out unwanted directories in-place
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith(".")]
        rel_path = os.path.relpath(root, LOCAL_BASE)
        if rel_path == ".":
            remote_dir = REMOTE_BASE
        else:
            remote_dir = REMOTE_BASE + "/" + rel_path.replace("\\", "/")
            try:
                sftp.stat(remote_dir)
            except FileNotFoundError:
                print(f"Creating remote directory: {remote_dir}")
                sftp.mkdir(remote_dir)

        for f in files:
            if f in EXCLUDE or f.startswith("."):
                continue
            local_file = os.path.join(root, f)
            remote_file = remote_dir + "/" + f
            print(f"Uploading: {f} -> {remote_file}")
            sftp.put(local_file, remote_file)
            sftp.chmod(remote_file, 0o644)
            total_files += 1

    print(f"\nAll {total_files} files uploaded successfully to {REMOTE_BASE}!")
    
    # Verify remote files
    print("\nVerifying remote directory contents:")
    stdin, stdout, stderr = ssh.exec_command(f"ls -la {REMOTE_BASE}; ls -la {REMOTE_BASE}/api; ls -la {REMOTE_BASE}/config")
    print(stdout.read().decode())

    sftp.close()
    ssh.close()
    print("Deployment finished successfully!")

if __name__ == "__main__":
    deploy()
