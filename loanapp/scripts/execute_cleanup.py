import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('217.21.84.194', port=65002, username='u529002218', password='Jyoti45@jrs')

php_cleanup = """<?php
$loanPdo = new PDO('mysql:host=localhost;dbname=u529002218_Loan1;charset=utf8mb4', 'u529002218_Loan1', 'Loan1@1234', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
]);

$cutoff = '2026-10-16 00:00:00';
echo "=== EXECUTING DATABASE CLEANUP BEFORE $cutoff ===\\n\\n";

// 1. Fetch test application IDs
$appIdsStmt = $loanPdo->query("SELECT id FROM loan_applications WHERE created_at < '$cutoff'");
$appIds = $appIdsStmt->fetchAll(PDO::FETCH_COLUMN);
echo "Found " . count($appIds) . " loan applications created before $cutoff.\\n";

// 2. Fetch test customer user IDs (protect admin & credit manager)
$userIdsStmt = $loanPdo->query("SELECT id, name, email, role FROM users WHERE created_at < '$cutoff' AND role NOT IN ('admin', 'super_admin', 'credit_manager') AND id NOT IN (1, 2)");
$testUsers = $userIdsStmt->fetchAll(PDO::FETCH_ASSOC);
$userIds = array_column($testUsers, 'id');
echo "Found " . count($userIds) . " test customer accounts created before $cutoff (Admin accounts preserved).\\n\\n";

// Disable foreign key checks for clean cascading removal
$loanPdo->exec("SET FOREIGN_KEY_CHECKS = 0");

$deletedCounts = [];

if (!empty($appIds)) {
    $appIdList = implode(',', array_map('intval', $appIds));
    
    $appTables = [
        'application_documents' => 'application_id',
        'application_personal_details' => 'application_id',
        'application_employment_details' => 'application_id',
        'application_financial_details' => 'application_id',
        'application_status_history' => 'application_id',
        'loan_offers' => 'application_id',
        'payment_records' => 'application_id',
        'disbursement_records' => 'application_id',
        'formalities' => 'application_id',
        'information_requests' => 'application_id',
        'internal_notes' => 'application_id',
        'assessments' => 'application_id',
        'decisions' => 'application_id',
        'loan_repayment_schedules' => 'application_id',
        'loan_repayment_transactions' => 'application_id',
    ];

    foreach ($appTables as $tbl => $col) {
        try {
            $stmt = $loanPdo->exec("DELETE FROM `$tbl` WHERE `$col` IN ($appIdList)");
            $deletedCounts[$tbl] = $stmt;
            echo "Deleted $stmt rows from $tbl\\n";
        } catch (Exception $e) {
            echo "Error deleting from $tbl: " . $e->getMessage() . "\\n";
        }
    }

    // Delete loan applications themselves
    $appStmt = $loanPdo->exec("DELETE FROM `loan_applications` WHERE id IN ($appIdList)");
    $deletedCounts['loan_applications'] = $appStmt;
    echo "Deleted $appStmt rows from loan_applications\\n";
}

// Delete related notifications and audit logs before cutoff
try {
    $notifStmt = $loanPdo->exec("DELETE FROM `notifications` WHERE created_at < '$cutoff'");
    $deletedCounts['notifications'] = $notifStmt;
    echo "Deleted $notifStmt rows from notifications\\n";
} catch (Exception $e) {
    echo "notifications error: " . $e->getMessage() . "\\n";
}

try {
    $auditStmt = $loanPdo->exec("DELETE FROM `audit_logs` WHERE created_at < '$cutoff'");
    $deletedCounts['audit_logs'] = $auditStmt;
    echo "Deleted $auditStmt rows from audit_logs\\n";
} catch (Exception $e) {
    echo "audit_logs error: " . $e->getMessage() . "\\n";
}

// Delete test customer accounts and tokens
if (!empty($userIds)) {
    $userIdList = implode(',', array_map('intval', $userIds));
    try {
        $tokenStmt = $loanPdo->exec("DELETE FROM `personal_access_tokens` WHERE tokenable_id IN ($userIdList) OR created_at < '$cutoff'");
        $deletedCounts['personal_access_tokens'] = $tokenStmt;
        echo "Deleted $tokenStmt rows from personal_access_tokens\\n";
    } catch (Exception $e) {
        echo "tokens error: " . $e->getMessage() . "\\n";
    }

    try {
        $userStmt = $loanPdo->exec("DELETE FROM `users` WHERE id IN ($userIdList)");
        $deletedCounts['users'] = $userStmt;
        echo "Deleted $userStmt rows from users (customers)\\n";
    } catch (Exception $e) {
        echo "users error: " . $e->getMessage() . "\\n";
    }
}

// Re-enable foreign key checks
$loanPdo->exec("SET FOREIGN_KEY_CHECKS = 1");

// Also clean old test orders in u529002218_Rcrpayment1
$payPdo = new PDO('mysql:host=localhost;dbname=u529002218_Rcrpayment1;charset=utf8mb4', 'u529002218_Rcrpayment1', 'Rcrpayment1@1234');
try {
    $orderStmt = $payPdo->exec("DELETE FROM `orders` WHERE created_at < '$cutoff'");
    echo "\\nDeleted $orderStmt old test orders from u529002218_Rcrpayment1.orders\\n";
} catch (Exception $e) {
    echo "orders cleanup error: " . $e->getMessage() . "\\n";
}

echo "\\n=== POST-CLEANUP REMAINING DATA VERIFICATION ===\\n";
$tables = ['loan_applications', 'payment_records', 'application_documents', 'loan_offers', 'loan_repayment_schedules', 'users'];
foreach ($tables as $t) {
    $rem = $loanPdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
    echo "- $t: $rem active rows remaining\\n";
}

$remOrders = $payPdo->query("SELECT COUNT(*) FROM `orders`")->fetchColumn();
echo "- orders (rcrpayment1): $remOrders active orders remaining\\n";

echo "\\nRemaining Users in System:\\n";
$allUsers = $loanPdo->query("SELECT id, name, email, role, created_at FROM users ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
foreach ($allUsers as $u) {
    echo "  [ID: {$u['id']}] {$u['name']} ({$u['email']}) - Role: {$u['role']} - Registered: {$u['created_at']}\\n";
}
"""

sftp = client.open_sftp()
with sftp.file('/home/u529002218/execute_cleanup.php', 'w') as f:
    f.write(php_cleanup)
sftp.close()

stdin, stdout, stderr = client.exec_command('/opt/alt/php82/usr/bin/php /home/u529002218/execute_cleanup.php')
print(stdout.read().decode())
err = stderr.read().decode()
if err:
    print("ERR:", err)

client.exec_command('rm -f /home/u529002218/execute_cleanup.php')
client.close()
