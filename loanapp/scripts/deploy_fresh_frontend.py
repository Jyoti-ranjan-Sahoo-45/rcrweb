import os
import sys
import paramiko

HOST = '217.21.84.194'
PORT = 65002
USERNAME = 'u529002218'
PASSWORD = 'Jyoti45@jrs'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)

sftp = client.open_sftp()

BASE_DIR = r'd:\rcrweb' if os.path.exists(r'd:\rcrweb') else r'c:\jyoti\rcrweb'
local_dist = os.path.join(BASE_DIR, 'loanapp', 'frontend', 'dist')
local_html = os.path.join(local_dist, 'index.html')

# Auto-detect latest JS and CSS
js_files = [f for f in os.listdir(os.path.join(local_dist, 'assets')) if f.startswith('index-') and f.endswith('.js')]
css_files = [f for f in os.listdir(os.path.join(local_dist, 'assets')) if f.startswith('index-') and f.endswith('.css')]
current_js = js_files[0]
current_css = css_files[0]
local_js = os.path.join(local_dist, 'assets', current_js)
local_css = os.path.join(local_dist, 'assets', current_css)

print(f'Detected assets: {current_js}, {current_css}', flush=True)

remote_dirs = [
    '/home/u529002218/domains/rcrfinance.com/backend/public',
    '/home/u529002218/domains/rcrfinance.com/public_html',
    '/home/u529002218/domains/antiquewhite-fish-888897.hostingersite.com/public_html',
]

print('1. Uploading backend files (controllers, services, config)...', flush=True)
backend_files = [
    (os.path.join(BASE_DIR, 'loanapp/backend/app/Enums/LoanStatus.php'), '/home/u529002218/domains/rcrfinance.com/backend/app/Enums/LoanStatus.php'),
    (os.path.join(BASE_DIR, 'loanapp/backend/app/Models/User.php'), '/home/u529002218/domains/rcrfinance.com/backend/app/Models/User.php'),
    (os.path.join(BASE_DIR, 'loanapp/backend/app/Models/LoanApplication.php'), '/home/u529002218/domains/rcrfinance.com/backend/app/Models/LoanApplication.php'),
    (os.path.join(BASE_DIR, 'loanapp/backend/app/Http/Controllers/DashboardController.php'), '/home/u529002218/domains/rcrfinance.com/backend/app/Http/Controllers/DashboardController.php'),
    (os.path.join(BASE_DIR, 'loanapp/backend/app/Http/Controllers/StaffEmployeeController.php'), '/home/u529002218/domains/rcrfinance.com/backend/app/Http/Controllers/StaffEmployeeController.php'),
    (os.path.join(BASE_DIR, 'loanapp/backend/app/Http/Controllers/StaffApplicationController.php'), '/home/u529002218/domains/rcrfinance.com/backend/app/Http/Controllers/StaffApplicationController.php'),
    (os.path.join(BASE_DIR, 'loanapp/backend/app/Http/Controllers/StaffOperationsController.php'), '/home/u529002218/domains/rcrfinance.com/backend/app/Http/Controllers/StaffOperationsController.php'),
    (os.path.join(BASE_DIR, 'loanapp/backend/app/Http/Controllers/LoanApplicationController.php'), '/home/u529002218/domains/rcrfinance.com/backend/app/Http/Controllers/LoanApplicationController.php'),
    (os.path.join(BASE_DIR, 'loanapp/backend/app/Http/Controllers/AuthController.php'), '/home/u529002218/domains/rcrfinance.com/backend/app/Http/Controllers/AuthController.php'),
    (os.path.join(BASE_DIR, 'loanapp/backend/app/Http/Controllers/PaymentController.php'), '/home/u529002218/domains/rcrfinance.com/backend/app/Http/Controllers/PaymentController.php'),
    (os.path.join(BASE_DIR, 'loanapp/backend/app/Services/MetaCapiService.php'), '/home/u529002218/domains/rcrfinance.com/backend/app/Services/MetaCapiService.php'),
    (os.path.join(BASE_DIR, 'loanapp/backend/config/services.php'), '/home/u529002218/domains/rcrfinance.com/backend/config/services.php'),
    (os.path.join(BASE_DIR, 'loanapp/backend/bootstrap/app.php'), '/home/u529002218/domains/rcrfinance.com/backend/bootstrap/app.php'),
    (os.path.join(BASE_DIR, 'loanapp/backend/routes/api.php'), '/home/u529002218/domains/rcrfinance.com/backend/routes/api.php'),
    (os.path.join(BASE_DIR, 'pay-desk.php'), '/home/u529002218/domains/rcrgroups.shop/public_html/pay-desk.php'),
    (os.path.join(BASE_DIR, 'pay-desk.php'), '/home/u529002218/domains/rcrfinance.com/public_html/pay-desk.php'),
    (os.path.join(BASE_DIR, 'index.html'), '/home/u529002218/domains/rcrgroups.shop/public_html/index.html'),
    (os.path.join(BASE_DIR, 'contact.html'), '/home/u529002218/domains/rcrgroups.shop/public_html/contact.html'),
    (os.path.join(BASE_DIR, 'about.html'), '/home/u529002218/domains/rcrgroups.shop/public_html/about.html'),
    (os.path.join(BASE_DIR, 'privacy-policy.html'), '/home/u529002218/domains/rcrgroups.shop/public_html/privacy-policy.html'),
    (os.path.join(BASE_DIR, 'refund-policy.html'), '/home/u529002218/domains/rcrgroups.shop/public_html/refund-policy.html'),
    (os.path.join(BASE_DIR, 'shipping-policy.html'), '/home/u529002218/domains/rcrgroups.shop/public_html/shipping-policy.html'),
    (os.path.join(BASE_DIR, 'templates.html'), '/home/u529002218/domains/rcrgroups.shop/public_html/templates.html'),
    (os.path.join(BASE_DIR, 'terms-and-conditions.html'), '/home/u529002218/domains/rcrgroups.shop/public_html/terms-and-conditions.html'),
]

for lpath, rpath in backend_files:
    if os.path.exists(lpath):
        sftp.put(lpath, rpath)
        print(f'Uploaded backend file -> {rpath}', flush=True)

# Ensure remote .env has META credentials
remote_env_path = '/home/u529002218/domains/rcrfinance.com/backend/.env'
try:
    with sftp.open(remote_env_path, 'r') as f:
        env_content = f.read().decode('utf-8')
    
    if 'META_PIXEL_ID' not in env_content:
        meta_env_snippet = '\n\nMETA_PIXEL_ID=1792100208524597/nMETA_CAPI_ACCESS_TOKEN="EAAcblU50CjIBSZBUbeDCKQCVZAZAAQQcTMJ8ZAuk2cBqCkrt62XKuSbT5UtTOiSZBGNTjrUvje6LiBmRgpu59zmZBZAf2sY4c10ZAKaQKgwtHnShWM7vSs3RZAXgCJ6Y991Cl7KXH00MXQob8NBgqQetZCJ4CTh2Ht7XlNqEhxclzTZBEbvMkPoZCxgUlGZCTPoiKYk09ywZDZD"\n'
        with sftp.open(remote_env_path, 'a') as f:
            f.write(meta_env_snippet.encode('utf-8'))
        print('Appended META_PIXEL_ID and META_CAPI_ACCESS_TOKEN to remote .env', flush=True)
    else:
        print('Remote .env already contains META_PIXEL_ID.', flush=True)
except Exception as e:
    print(f'Warning reading/updating remote .env: {e}', flush=True)

print('2. Uploading new assets to remote targets...', flush=True)
for rdir in remote_dirs:
    sftp.put(local_html, f'{rdir}/index.html')
    print(f'Uploaded index.html -> {rdir}/index.html', flush=True)
    
    # Upload only the new JS bundle and CSS bundle
    sftp.put(local_js, f'{rdir}/assets/{current_js}')
    print(f'Uploaded JS -> {rdir}/assets/{current_js}', flush=True)
    sftp.put(local_css, f'{rdir}/assets/{current_css}')
    print(f'Uploaded CSS -> {rdir}/assets/{current_css}', flush=True)

sftp.close()
print('SFTP closed successfully.', flush=True)

print('\n3. Removing old JS and CSS bundles...', flush=True)
for rdir in remote_dirs:
    cmd = f'cd {rdir}/assets && find . -maxdepth 1 -name "index-*.js" ! -name "{current_js}" -delete'
    stdin, stdout, stderr = client.exec_command(cmd)
    stdout.channel.recv_exit_status()
    cmd2 = f'cd {rdir}/assets && find . -maxdepth 1 -name "index-*.css" ! -name "{current_css}" -delete'
    stdin, stdout, stderr = client.exec_command(cmd2)
    stdout.channel.recv_exit_status()

print('\n4. Clearing Laravel backend optimize cache...', flush=True)
stdin, stdout, stderr = client.exec_command('/opt/alt/php82/usr/bin/php /home/u529002218/domains/rcrfinance.com/backend/artisan optimize:clear')
print(stdout.read().decode(), flush=True)

print('\n5. Verifying deployed index.html on server...', flush=True)
stdin, stdout, stderr = client.exec_command('cat /home/u529002218/domains/rcrfinance.com/public_html/index.html')
print(stdout.read().decode(), flush=True)

client.close()
print('Deployment finished successfully.', flush=True)
