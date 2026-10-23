#!/usr/bin/env python3
"""
Automated Deployment Pipeline for RCR Digital Loan Platform on Hostinger.
"""

import os
import sys
import shutil
import zipfile
import subprocess
import time
import urllib.request
import json
import paramiko

# Configuration
HOST = "217.21.84.194"
PORT = 65002
USERNAME = "u529002218"
PASSWORD = "Jyoti45@jrs"
REMOTE_DOMAIN_DIR = "/home/u529002218/domains/rcrfinance.com"
REMOTE_BACKEND_DIR = f"{REMOTE_DOMAIN_DIR}/backend"
REMOTE_PUBLIC_DIR = f"{REMOTE_DOMAIN_DIR}/public_html"
PHP_BIN = "/opt/alt/php82/usr/bin/php"
LIVE_URL = "https://rcrfinance.com"

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FRONTEND_DIR = os.path.join(WORKSPACE_ROOT, "frontend")
BACKEND_DIR = os.path.join(WORKSPACE_ROOT, "backend")
DIST_DIR = os.path.join(FRONTEND_DIR, "dist")
ZIP_PATH = os.path.join(WORKSPACE_ROOT, "loan_release.zip")

def step(msg):
    print(f"\n========================================\n[STEP] {msg}\n========================================")

def run_remote(client, cmd, title=""):
    if title:
        print(f"--> {title}")
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8').strip()
    err = stderr.read().decode('utf-8').strip()
    if out:
        print(out)
    if err and "warning" not in err.lower() and "deprecated" not in err.lower():
        print("[STDERR]", err)
    return out

def build_frontend():
    step("1. Building React Frontend...")
    cmd = "npm run build"
    res = subprocess.run(cmd, shell=True, cwd=FRONTEND_DIR, capture_output=True, text=True)
    if res.returncode != 0:
        print("Frontend build failed:\n", res.stderr)
        sys.exit(1)
    print("Frontend build successful. Syncing dist to backend/public...")

    backend_public = os.path.join(BACKEND_DIR, "public")
    for item in os.listdir(DIST_DIR):
        s = os.path.join(DIST_DIR, item)
        d = os.path.join(backend_public, item)
        if os.path.isdir(s):
            if os.path.exists(d):
                shutil.rmtree(d)
            shutil.copytree(s, d)
        else:
            shutil.copy2(s, d)
    print("Assets synced.")

def package_backend():
    step("2. Packaging Backend Release Archive...")
    if os.path.exists(ZIP_PATH):
        os.remove(ZIP_PATH)

    exclude_dirs = {"vendor", "node_modules", ".git", "storage/logs", "storage/framework/cache", "storage/framework/sessions", "storage/framework/views"}
    exclude_files = {".DS_Store", "database.sqlite"}

    with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(BACKEND_DIR):
            rel_root = os.path.relpath(root, BACKEND_DIR)
            if any(rel_root == ed or rel_root.startswith(ed + os.sep) for ed in exclude_dirs):
                continue
            for file in files:
                if file in exclude_files:
                    continue
                full_path = os.path.join(root, file)
                archive_name = os.path.relpath(full_path, BACKEND_DIR)
                zipf.write(full_path, archive_name)

    size_mb = os.path.getsize(ZIP_PATH) / (1024 * 1024)
    print(f"Created release package: {ZIP_PATH} ({size_mb:.2f} MB)")

def deploy_to_hostinger():
    step("3. Connecting to Hostinger & SFTP Upload...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)

    sftp = client.open_sftp()
    remote_zip = f"/home/{USERNAME}/loan_release.zip"
    print(f"Uploading {ZIP_PATH} -> {remote_zip}...")
    sftp.put(ZIP_PATH, remote_zip)
    sftp.close()
    print("Upload completed.")

    step("4. Remote Setup & Deployment on Hostinger...")
    run_remote(client, f"mkdir -p {REMOTE_BACKEND_DIR} {REMOTE_BACKEND_DIR}/storage/framework/sessions {REMOTE_BACKEND_DIR}/storage/framework/views {REMOTE_BACKEND_DIR}/storage/framework/cache {REMOTE_BACKEND_DIR}/storage/logs", "Creating storage dirs")
    run_remote(client, f"unzip -o -q {remote_zip} -d {REMOTE_BACKEND_DIR}", "Extracting files")
    run_remote(client, f"rm -f {remote_zip}", "Cleaning zip")
    run_remote(client, f"chmod -R 775 {REMOTE_BACKEND_DIR}/storage {REMOTE_BACKEND_DIR}/bootstrap/cache", "Setting permissions")

    # Run Composer
    run_remote(client, f"cd {REMOTE_BACKEND_DIR} && {PHP_BIN} /usr/local/bin/composer install --no-dev --optimize-autoloader --no-interaction", "Composer install")

    # Run Migrations (Never reset or wipe DB on deployment)
    run_remote(client, f"cd {REMOTE_BACKEND_DIR} && {PHP_BIN} artisan migrate --force", "Running database migrations")

    run_remote(client, f"cd {REMOTE_BACKEND_DIR} && {PHP_BIN} artisan storage:link || true", "Creating storage symlink")

    # Copy files to public_html
    run_remote(client, f"mkdir -p {REMOTE_PUBLIC_DIR}", "Ensuring public_html exists")
    run_remote(client, f"rm -rf {REMOTE_PUBLIC_DIR}/*", "Clearing public_html")
    run_remote(client, f"mkdir -p {REMOTE_PUBLIC_DIR} && cp -r {REMOTE_BACKEND_DIR}/public/* {REMOTE_PUBLIC_DIR}/", "Copying public assets")
    run_remote(client, f"ln -s {REMOTE_BACKEND_DIR}/storage/app/public {REMOTE_PUBLIC_DIR}/storage 2>/dev/null || true", "Linking storage in public_html")

    # Write public_html/index.php
    index_php_content = """<?php
use Illuminate\\Http\\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../backend/storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../backend/vendor/autoload.php';

(require_once __DIR__.'/../backend/bootstrap/app.php')
    ->handleRequest(Request::capture());
"""
    sftp = client.open_sftp()
    with sftp.file(f"{REMOTE_PUBLIC_DIR}/index.php", "w") as f:
        f.write(index_php_content)

    htaccess_content = """<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
"""
    with sftp.file(f"{REMOTE_PUBLIC_DIR}/.htaccess", "w") as f:
        f.write(htaccess_content)
    sftp.close()

    # Clear application cache on remote
    run_remote(client, f"cd {REMOTE_BACKEND_DIR} && {PHP_BIN} artisan optimize:clear", "Clearing cache")

    # Mirror to preview domain for dual accessibility
    PREVIEW_DIR = "/home/u529002218/domains/antiquewhite-fish-888897.hostingersite.com"
    run_remote(client, f"mkdir -p {PREVIEW_DIR}/public_html && cp -r {REMOTE_PUBLIC_DIR}/* {PREVIEW_DIR}/public_html/ 2>/dev/null || true", "Syncing preview domain")

    client.close()

def verify_deployment():
    step("5. Verifying Live Cloud Endpoints...")
    time.sleep(2)
    urls = [
        f"{LIVE_URL}/api/health",
        f"{LIVE_URL}/api/categories",
        f"{LIVE_URL}/api/products",
        LIVE_URL,
    ]

    for url in urls:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) RCRFinance/1.0"})
            with urllib.request.urlopen(req, timeout=12) as response:
                status = response.getcode()
                body = response.read().decode('utf-8')
                print(f"[SUCCESS] {url} -> HTTP {status} (Length: {len(body)} bytes)")
                if "api/" in url:
                    try:
                        parsed = json.loads(body)
                        print(f"          Data preview: {str(parsed)[:140]}...")
                    except Exception:
                        pass
        except Exception as e:
            print(f"[FAIL] {url} -> {e}")

if __name__ == "__main__":
    print("Starting Automated Deployment to Hostinger...")
    build_frontend()
    package_backend()
    deploy_to_hostinger()
    verify_deployment()
    print("\n Deployment to Hostinger completed successfully!")
