import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('217.21.84.194', port=65002, username='u529002218', password='Jyoti45@jrs')

php_script = """
$loanPdo = new PDO('mysql:host=localhost;dbname=u529002218_Loan1;charset=utf8mb4', 'u529002218_Loan1', 'Loan1@1234');
$tables = ['loan_applications', 'payment_records', 'application_documents', 'loan_offers', 'repayment_schedules', 'transactions', 'personal_details', 'bank_details', 'employment_details', 'users'];

echo "=== LOAN DATABASE (u529002218_Loan1) ===\\n";
foreach ($tables as $t) {
    try {
        $dateCol = 'created_at';
        $q = $loanPdo->query("SELECT COUNT(*) as c FROM $t WHERE $dateCol < '2026-10-16 00:00:00'");
        $beforeCount = $q->fetch(PDO::FETCH_ASSOC)['c'];
        $qTot = $loanPdo->query("SELECT COUNT(*) as c FROM $t");
        $totCount = $qTot->fetch(PDO::FETCH_ASSOC)['c'];
        echo "$t: $beforeCount rows before 2026-10-16 (Total: $totCount)\\n";
    } catch(Exception $e) {
        echo "$t: " . $e->getMessage() . "\\n";
    }
}

// Check admin users vs customer users in users table
try {
    $qAdmin = $loanPdo->query("SELECT id, name, email, role, created_at FROM users WHERE role = 'admin' OR is_admin = 1");
    $admins = $qAdmin->fetchAll(PDO::FETCH_ASSOC);
    echo "\\nAdmin users (MUST NOT BE DELETED):\\n";
    foreach ($admins as $a) {
        echo "- ID: {$a['id']}, Name: {$a['name']}, Email: {$a['email']}\\n";
    }
} catch(Exception $e) {
    echo "Admin check error: " . $e->getMessage() . "\\n";
}

$payPdo = new PDO('mysql:host=localhost;dbname=u529002218_Rcrpayment1;charset=utf8mb4', 'u529002218_Rcrpayment1', 'Rcrpayment1@1234');
echo "\\n=== PAYMENT DATABASE (u529002218_Rcrpayment1) ===\\n";
try {
    $q = $payPdo->query("SELECT COUNT(*) as c FROM orders WHERE created_at < '2026-10-16 00:00:00'");
    $beforeCount = $q->fetch(PDO::FETCH_ASSOC)['c'];
    $qTot = $payPdo->query("SELECT COUNT(*) as c FROM orders");
    $totCount = $qTot->fetch(PDO::FETCH_ASSOC)['c'];
    echo "orders: $beforeCount rows before 2026-10-16 (Total: $totCount)\\n";
} catch(Exception $e) {
    echo "orders error: " . $e->getMessage() . "\\n";
}
"""

stdin, stdout, stderr = client.exec_command(f"/opt/alt/php82/usr/bin/php -r '{php_script}'")
print(stdout.read().decode())
err = stderr.read().decode()
if err:
    print("ERR:", err)
client.close()
