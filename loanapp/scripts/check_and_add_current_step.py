import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('217.21.84.194', port=65002, username='u529002218', password='Jyoti45@jrs')

check_sql = "mysql -u u529002218_Loan1 -p'Loan1@1234' u529002218_Loan1 -e \"SHOW COLUMNS FROM loan_applications LIKE 'current_step';\""
stdin, stdout, stderr = client.exec_command(check_sql)
output = stdout.read().decode()

if 'current_step' in output:
    print("Column current_step already exists in loan_applications.")
else:
    print("Adding current_step column to loan_applications...")
    add_sql = "mysql -u u529002218_Loan1 -p'Loan1@1234' u529002218_Loan1 -e \"ALTER TABLE loan_applications ADD COLUMN current_step TINYINT UNSIGNED NOT NULL DEFAULT 1 AFTER current_status;\""
    stdin, stdout, stderr = client.exec_command(add_sql)
    err = stderr.read().decode()
    if err:
        print("Error adding column:", err)
    else:
        print("Column current_step added successfully.")

# Verify
stdin, stdout, stderr = client.exec_command(check_sql)
print("Verification:")
print(stdout.read().decode())

client.close()
