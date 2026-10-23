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

local_dist = r'c:\jyoti\rcrweb\loanapp\frontend\dist'
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

print('1. Uploading backend files (controllers, routes)...', flush=True)
backend_files = [
    (r'c:\jyoti\rcrweb\loanapp\backend\app\Models\User.php', '/home/u529002218/domains/rcrfinance.com/backend/app/Models/User.php'),
    (r'c:\jyoti\rcrweb\loanapp\backend\app\Models\LoanApplication.php', '/home/u529002218/domains/rcrfinance.com/backend/app/Models/LoanApplication.php'),
    (r'c:\jyoti\rcrweb\loanapp\backend\app\Http\Controllers\DashboardController.php', '/home/u529002218/domains/rcrfinance.com/backend/app/Http/Controllers/DashboardController.php'),
    (r'c:\jyoti\rcrweb\loanapp\backend\app\Http\Controllers\StaffEmployeeController.php', '/home/u529002218/domains/rcrfinance.com/backend/app/Http/Controllers/StaffEmployeeController.php'),
    (r'c:\jyoti\rcrweb\loanapp\backend\app\Http\Controllers\StaffApplicationController.php', '/home/u529002218/domains/rcrfinance.com/backend/app/Http/Controllers/StaffApplicationController.php'),
    (r'c:\jyoti\rcrweb\loanapp\backend\app\Http\Controllers\StaffOperationsController.php', '/home/u529002218/domains/rcrfinance.com/backend/app/Http/Controllers/StaffOperationsController.php'),
    (r'c:\jyoti\rcrweb\loanapp\backend\app\Http\Controllers\LoanApplicationController.php', '/home/u529002218/domains/rcrfinance.com/backend/app/Http/Controllers/LoanApplicationController.php'),
    (r'c:\jyoti\rcrweb\loanapp\backend\app\Http\Controllers\AuthController.php', '/home/u529002218/domains/rcrfinance.com/backend/app/Http/Controllers/AuthController.php'),
    (r'c:\jyoti\rcrweb\loanapp\backend\bootstrap\app.php', '/home/u529002218/domains/rcrfinance.com/backend/bootstrap/app.php'),
    (r'c:\jyoti\rcrweb\loanapp\backend\routes\api.php', '/home/u529002218/domains/rcrfinance.com/backend/routes/api.php'),
    (r'c:\jyoti\rcrweb\pay-desk.php', '/home/u529002218/domains/rcrgroups.shop/public_html/pay-desk.php'),
    (r'c:\jyoti\rcrweb\pay-desk.php', '/home/u529002218/domains/rcrfinance.com/public_html/pay-desk.php'),
]

for lpath, rpath in backend_files:
    if os.path.exists(lpath):
        sftp.put(lpath, rpath)
        print(f'Uploaded backend file -> {rpath}', flush=True)

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
