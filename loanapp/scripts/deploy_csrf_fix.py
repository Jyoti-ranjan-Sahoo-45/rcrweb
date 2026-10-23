import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('217.21.84.194', port=65002, username='u529002218', password='Jyoti45@jrs')

sftp = client.open_sftp()
local_app = r'c:\jyoti\rcrweb\loanapp\backend\bootstrap\app.php'
remote_app = '/home/u529002218/domains/rcrfinance.com/backend/bootstrap/app.php'

sftp.put(local_app, remote_app)
print("Uploaded bootstrap/app.php ->", remote_app)

stdin, stdout, stderr = client.exec_command('/opt/alt/php82/usr/bin/php /home/u529002218/domains/rcrfinance.com/backend/artisan optimize:clear')
print(stdout.read().decode())

sftp.close()
client.close()
