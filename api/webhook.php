<?php
/**
 * RCR Groups - Cashfree Webhook Handler
 * Server-to-server asynchronous payment notifications
 */

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/cashfree.php';
require_once __DIR__ . '/../config/loan_db.php';

$rawBody = file_get_contents('php://input');

if (empty($rawBody)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Empty webhook body']);
    exit;
}

$payload = json_decode($rawBody, true);

// Extract order_id from Cashfree webhook format
$order_id = null;
if (isset($payload['data']['order']['order_id'])) {
    $order_id = $payload['data']['order']['order_id'];
} elseif (isset($payload['order']['order_id'])) {
    $order_id = $payload['order']['order_id'];
} elseif (isset($payload['order_id'])) {
    $order_id = $payload['order_id'];
}

if ($order_id) {
    // Perform server-to-server verification directly with Cashfree
    $res = verify_cashfree_order($order_id, $pdo);
    error_log("Cashfree Webhook processed for order {$order_id}: " . json_encode($res));

    if (!empty($res['verified']) && !empty($res['order']['loan_app_id'])) {
        sync_loan_payment_success(
            $res['order']['loan_app_id'], 
            $res['order']['order_amount'], 
            $res['cf_payment_id'], 
            $res['payment_method'] ?? 'online_gateway'
        );
    }
    
    http_response_code(200);
    echo json_encode(['status' => 'OK', 'order_id' => $order_id, 'verified' => $res['verified']]);
} else {
    http_response_code(200);
    echo json_encode(['status' => 'ignored', 'message' => 'No order_id found']);
}
