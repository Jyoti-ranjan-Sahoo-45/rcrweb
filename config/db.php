<?php
/**
 * RCR Groups - Database Configuration
 * Hostinger MySQL Connection
 */

$db_host = 'localhost';
$db_name = 'u529002218_Rcrpayment1';
$db_user = 'u529002218_Rcrpayment1';
$db_pass = 'Rcrpayment1@1234';

try {
    $pdo = new PDO(
        "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed. Please contact support.'
    ]);
    exit;
}
