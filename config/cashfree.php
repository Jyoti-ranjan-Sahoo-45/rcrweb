<?php
/**
 * RCR Groups - Cashfree Payment Gateway Configuration
 * Official Cashfree PG 2023-08-01 Production Environment
 */

define('CASHFREE_APP_ID', '1472497c3b0806b379a225a0bd37942741');
define('CASHFREE_SECRET_KEY', 'cfsk_ma_prod_28383bc870ea30fe1f607f3a9f41699b_33e74b7d');
define('CASHFREE_API_VERSION', '2023-08-01');
define('CASHFREE_BASE_URL', 'https://api.cashfree.com/pg');
define('SITE_BASE_URL', 'https://rcrgroups.shop');

/**
 * Execute a secure cURL request to Cashfree Payment Gateway
 *
 * @param string $endpoint API endpoint relative to base (e.g. '/orders')
 * @param string $method HTTP method (GET, POST, etc.)
 * @param array|null $payload Data array for POST requests
 * @return array Decoded JSON response or error details
 */
function cashfree_request($endpoint, $method = 'GET', $payload = null) {
    $url = CASHFREE_BASE_URL . $endpoint;
    $ch = curl_init();

    $headers = [
        'x-client-id: ' . CASHFREE_APP_ID,
        'x-client-secret: ' . CASHFREE_SECRET_KEY,
        'x-api-version: ' . CASHFREE_API_VERSION,
        'Content-Type: application/json',
        'Accept: application/json'
    ];

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($payload !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        }
    } elseif ($method !== 'GET') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        return [
            'http_code' => 500,
            'success' => false,
            'error' => 'cURL error: ' . $curlError
        ];
    }

    $data = json_decode($response, true);
    return [
        'http_code' => $httpCode,
        'success' => ($httpCode >= 200 && $httpCode < 300),
        'data' => $data,
        'raw' => $response
    ];
}

/**
 * Verify order status with Cashfree and update MySQL database
 *
 * @param string $order_id
 * @param PDO $pdo
 * @return array Verification results and order record
 */
function verify_cashfree_order($order_id, $pdo) {
    if (empty($order_id)) {
        return ['verified' => false, 'message' => 'Order ID is missing.'];
    }

    // 1. Fetch current order record from MySQL
    $stmt = $pdo->prepare("SELECT * FROM `orders` WHERE `order_id` = ? LIMIT 1");
    $stmt->execute([$order_id]);
    $order = $stmt->fetch();

    if (!$order) {
        return ['verified' => false, 'message' => 'Order not found in database.'];
    }

    // If already marked SUCCESS, return immediately
    if ($order['payment_status'] === 'SUCCESS') {
        return ['verified' => true, 'status' => 'SUCCESS', 'order' => $order];
    }

    // 2. Query Cashfree API directly for order status
    $orderResp = cashfree_request('/orders/' . urlencode($order_id), 'GET');
    if (!$orderResp['success'] || empty($orderResp['data'])) {
        return [
            'verified' => false, 
            'message' => 'Failed to retrieve order status from Cashfree.',
            'order' => $order
        ];
    }

    $cfOrder = $orderResp['data'];
    $orderStatus = $cfOrder['order_status'] ?? 'PENDING';

    // 3. Query Cashfree API for transaction payment details
    $paymentsResp = cashfree_request('/orders/' . urlencode($order_id) . '/payments', 'GET');
    $cfPaymentId = null;
    $paymentMethod = null;
    $isPaymentSuccess = false;

    if ($paymentsResp['success'] && is_array($paymentsResp['data'])) {
        foreach ($paymentsResp['data'] as $payment) {
            if (isset($payment['payment_status']) && $payment['payment_status'] === 'SUCCESS') {
                $isPaymentSuccess = true;
                $cfPaymentId = strval($payment['cf_payment_id'] ?? '');
                
                // Extract human-readable payment method
                if (isset($payment['payment_method'])) {
                    if (is_array($payment['payment_method'])) {
                        $paymentMethod = key($payment['payment_method']); // e.g., 'upi', 'card', 'netbanking'
                    } else {
                        $paymentMethod = strval($payment['payment_method']);
                    }
                }
                break;
            }
        }
    }

    // Check if order is verified as PAID
    if ($orderStatus === 'PAID' || $isPaymentSuccess) {
        $updateStmt = $pdo->prepare("
            UPDATE `orders` 
            SET `payment_status` = 'SUCCESS', 
                `cf_payment_id` = COALESCE(?, `cf_payment_id`), 
                `payment_method` = COALESCE(?, `payment_method`),
                `updated_at` = CURRENT_TIMESTAMP
            WHERE `order_id` = ?
        ");
        $updateStmt->execute([$cfPaymentId, $paymentMethod, $order_id]);

        // Refresh order record
        $stmt->execute([$order_id]);
        $order = $stmt->fetch();

        return [
            'verified' => true,
            'status' => 'SUCCESS',
            'cf_payment_id' => $cfPaymentId,
            'payment_method' => $paymentMethod,
            'order' => $order
        ];
    } elseif ($orderStatus === 'EXPIRED') {
        $updateStmt = $pdo->prepare("UPDATE `orders` SET `payment_status` = 'FAILED' WHERE `order_id` = ?");
        $updateStmt->execute([$order_id]);
        $order['payment_status'] = 'FAILED';
    }

    return [
        'verified' => false,
        'status' => $orderStatus,
        'message' => 'Payment has not been completed yet.',
        'order' => $order
    ];
}

