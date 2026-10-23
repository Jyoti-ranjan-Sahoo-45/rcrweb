<?php
/**
 * RCR Groups - Verify Cashfree Order API
 * Checks status directly against Cashfree server and updates MySQL
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/cashfree.php';

$order_id = trim($_GET['order_id'] ?? $_POST['order_id'] ?? '');

if (empty($order_id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing order_id parameter.']);
    exit;
}

$result = verify_cashfree_order($order_id, $pdo);

if ($result['verified']) {
    echo json_encode([
        'success' => true,
        'status' => 'SUCCESS',
        'order_id' => $order_id,
        'cf_payment_id' => $result['cf_payment_id'],
        'payment_method' => $result['payment_method'],
        'customer_name' => $result['order']['customer_name'],
        'customer_email' => $result['order']['customer_email'],
        'template_title' => $result['order']['template_title'],
        'amount' => $result['order']['order_amount']
    ]);
} else {
    echo json_encode([
        'success' => false,
        'status' => $result['status'] ?? 'PENDING',
        'message' => $result['message'] ?? 'Payment pending or verification failed.'
    ]);
}
