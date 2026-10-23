<?php
/**
 * RCR Groups - Create Cashfree Order API
 * Generates an order and returns payment_session_id for Cashfree Dropin/Checkout
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed. Use POST.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/cashfree.php';

// Read JSON input
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!$input) {
    // Fallback to $_POST if sent as form-encoded
    $input = $_POST;
}

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$phone = trim($input['phone'] ?? '');
$template_id = trim($input['template_id'] ?? 'rcr-template');
$template_title = trim($input['template_title'] ?? 'Digital HTML Template');
$amount = floatval($input['amount'] ?? 0);
$loan_app_id = trim($input['loan_app_id'] ?? '');
$return_app_url = trim($input['return_app_url'] ?? '');

// Basic Validations
if (empty($name)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Customer name is required.']);
    exit;
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

// Clean phone number (keep only digits, remove +91 if present)
$phoneDigits = preg_replace('/[^0-9]/', '', $phone);
if (strlen($phoneDigits) > 10 && substr($phoneDigits, 0, 2) === '91') {
    $phoneDigits = substr($phoneDigits, 2);
}
if (strlen($phoneDigits) < 10) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid 10-digit mobile number.']);
    exit;
}
$cleanPhone = substr($phoneDigits, -10);

if ($amount <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid order amount.']);
    exit;
}

// Generate unique Order ID and Customer ID
$order_id = 'RCR_' . date('YmdHis') . '_' . rand(100, 999);
$customer_id = 'CUST_' . $cleanPhone . '_' . substr(md5($email), 0, 4);

// Prepare Return URL
$is_modal = !empty($input['modal']) ? '1' : '0';
$returnUrl = SITE_BASE_URL . '/payment-success.php?order_id={order_id}';
if (!empty($loan_app_id)) {
    $returnUrl .= '&loan_app_id=' . urlencode($loan_app_id);
}
if ($is_modal === '1') {
    $returnUrl .= '&modal=1';
}

// Prepare Cashfree API Payload (Masked as digital documentation service)
$payload = [
    'order_id' => $order_id,
    'order_amount' => round($amount, 2),
    'order_currency' => 'INR',
    'customer_details' => [
        'customer_id' => $customer_id,
        'customer_name' => $name,
        'customer_email' => $email,
        'customer_phone' => $cleanPhone
    ],
    'order_meta' => [
        'return_url' => $returnUrl,
        'notify_url' => SITE_BASE_URL . '/api/webhook.php'
    ],
    'order_note' => 'RCR Documentation Service: ' . substr($template_title, 0, 60)
];

// Call Cashfree API
$cfResponse = cashfree_request('/orders', 'POST', $payload);

if (!$cfResponse['success'] || empty($cfResponse['data']['payment_session_id'])) {
    $errorMsg = $cfResponse['data']['message'] ?? ($cfResponse['error'] ?? 'Cashfree order generation failed.');
    error_log("Cashfree create order error: " . json_encode($cfResponse));
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'message' => $errorMsg,
        'details' => $cfResponse['data'] ?? null
    ]);
    exit;
}

$paymentSessionId = $cfResponse['data']['payment_session_id'];

// Insert order record into database
try {
    $stmt = $pdo->prepare("
        INSERT INTO `orders` 
        (`order_id`, `customer_name`, `customer_email`, `customer_phone`, `template_id`, `template_title`, `loan_app_id`, `return_app_url`, `order_amount`, `order_currency`, `payment_session_id`, `payment_status`) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', ?, 'PENDING')
    ");
    $stmt->execute([
        $order_id,
        $name,
        $email,
        $cleanPhone,
        $template_id,
        $template_title,
        $loan_app_id ?: null,
        $return_app_url ?: null,
        $amount,
        $paymentSessionId
    ]);
} catch (PDOException $e) {
    error_log("Database insert order error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save order record in database.']);
    exit;
}

// Return successful response with session ID
echo json_encode([
    'success' => true,
    'order_id' => $order_id,
    'payment_session_id' => $paymentSessionId,
    'amount' => $amount,
    'currency' => 'INR'
]);
