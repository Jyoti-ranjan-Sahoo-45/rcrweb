import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('217.21.84.194', port=65002, username='u529002218', password='Jyoti45@jrs')

php_code = """<?php
$pdo = new PDO('mysql:host=localhost;dbname=u529002218_Loan1;charset=utf8mb4', 'u529002218_Loan1', 'Loan1@1234');
$tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
echo "Tables in u529002218_Loan1:\\n";
foreach ($tables as $t) {
    $c = $pdo->query("SELECT COUNT(*) FROM `{$t}`")->fetchColumn();
    $b = 0;
    try {
        $b = $pdo->query("SELECT COUNT(*) FROM `{$t}` WHERE created_at < '2026-10-16 00:00:00'")->fetchColumn();
    } catch(Exception $e) {}
    echo "- {$t} (Total: {$c}, Before 16/10/2026: {$b})\\n";
}

echo "\\nColumns in users table:\\n";
$cols = $pdo->query('SHOW COLUMNS FROM users')->fetchAll(PDO::FETCH_ASSOC);
foreach ($cols as $c) {
    echo "  - {$c['Field']} ({$c['Type']})\\n";
}

echo "\\nAll users in users table:\\n";
$users = $pdo->query('SELECT id, name, email, phone, role, created_at FROM users')->fetchAll(PDO::FETCH_ASSOC);
foreach ($users as $u) {
    echo "  - ID: {$u['id']} | Name: {$u['name']} | Email: {$u['email']} | Role: {$u['role']} | Created: {$u['created_at']}\\n";
}
"""

sftp = client.open_sftp()
with sftp.file('/home/u529002218/check_data.php', 'w') as f:
    f.write(php_code)
sftp.close()

stdin, stdout, stderr = client.exec_command('/opt/alt/php82/usr/bin/php /home/u529002218/check_data.php')
print(stdout.read().decode())
print(stderr.read().decode())

client.exec_command('rm -f /home/u529002218/check_data.php')
client.close()
