import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('217.21.84.194', port=65002, username='u529002218', password='Jyoti45@jrs')

cmd = """mysql -u u529002218_Loan1 -p'Loan1@1234' u529002218_Loan1 -e "SELECT id, name, email, role, role_id, status FROM users WHERE role != 'customer';" """
stdin, stdout, stderr = client.exec_command(cmd)
print("Staff users in DB:")
print(stdout.read().decode())
print(stderr.read().decode())

client.close()
