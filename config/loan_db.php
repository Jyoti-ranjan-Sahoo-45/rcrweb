<?php
/**
 * RCR Groups - Connection to Loan Application Database (u529002218_Loan1)
 * Both databases are co-located on the same Hostinger MySQL server
 */

function get_loan_pdo() {
    static $loanPdo = null;
    if ($loanPdo !== null) {
        return $loanPdo;
    }

    $db_host = 'localhost';
    $db_name = 'u529002218_Loan1';
    $db_user = 'u529002218_Loan1';
    $db_pass = 'Loan1@1234';

    try {
        $loanPdo = new PDO(
            "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4",
            $db_user,
            $db_pass,
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]
        );
        return $loanPdo;
    } catch (PDOException $e) {
        error_log("Loan DB connection error: " . $e->getMessage());
        return null;
    }
}

/**
 * Automatically verify and update the Loan status in u529002218_Loan1
 *
 * @param int|string $application_id
 * @param float $amount
 * @param string $cf_payment_id
 * @param string $payment_method
 * @return bool
 */
function sync_loan_payment_success($application_id, $amount, $cf_payment_id, $payment_method = 'online_gateway') {
    $pdo = get_loan_pdo();
    if (!$pdo || empty($application_id)) {
        return false;
    }

    try {
        // 1. Find the application record by ID or Application Number
        $stmt = $pdo->prepare("SELECT id, application_number, user_id, current_status FROM `loan_applications` WHERE id = ? OR application_number = ? LIMIT 1");
        $stmt->execute([$application_id, $application_id]);
        $app = $stmt->fetch();

        if (!$app) {
            error_log("sync_loan_payment_success: Loan application {$application_id} not found.");
            return false;
        }

        $appNumericId = $app['id'];

        // 2. Check if a payment_records row already exists
        $stmt = $pdo->prepare("SELECT id, status FROM `payment_records` WHERE application_id = ? AND payment_type = 'processing_fee' ORDER BY id DESC LIMIT 1");
        $stmt->execute([$appNumericId]);
        $existingPayment = $stmt->fetch();

        if ($existingPayment) {
            $updatePayment = $pdo->prepare("
                UPDATE `payment_records` 
                SET `status` = 'verified', 
                    `payment_method` = ?, 
                    `gateway_reference` = ?, 
                    `utr_number` = ?, 
                    `paid_at` = CURRENT_TIMESTAMP, 
                    `verification_remarks` = 'Auto-verified via RCR Gateway',
                    `updated_at` = CURRENT_TIMESTAMP 
                WHERE `id` = ?
            ");
            $updatePayment->execute([$payment_method, $cf_payment_id, $cf_payment_id, $existingPayment['id']]);
        } else {
            $transId = 'TRX_' . strtoupper(substr(md5(uniqid()), 0, 10));
            $insertPayment = $pdo->prepare("
                INSERT INTO `payment_records` 
                (`application_id`, `transaction_id`, `utr_number`, `payment_type`, `amount`, `status`, `payment_method`, `gateway_reference`, `paid_at`, `verification_remarks`, `created_at`, `updated_at`) 
                VALUES (?, ?, ?, 'processing_fee', ?, 'verified', ?, ?, CURRENT_TIMESTAMP, 'Auto-verified via RCR Gateway', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ");
            $insertPayment->execute([
                $appNumericId,
                $transId,
                $cf_payment_id,
                $amount,
                $payment_method,
                $cf_payment_id
            ]);
        }

        // 3. Advance the loan application status to ready_for_disbursement
        $updateApp = $pdo->prepare("
            UPDATE `loan_applications` 
            SET `current_status` = 'ready_for_disbursement', 
                `updated_at` = CURRENT_TIMESTAMP 
            WHERE `id` = ?
        ");
        $updateApp->execute([$appNumericId]);

        // 4. Log in status history if table exists
        try {
            $historyStmt = $pdo->prepare("
                INSERT INTO `application_status_history` 
                (`application_id`, `from_status`, `to_status`, `changed_by_user_id`, `remarks`, `created_at`, `updated_at`) 
                VALUES (?, ?, 'ready_for_disbursement', NULL, 'Stamping Fee auto-verified via RCR Gateway', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ");
            $historyStmt->execute([$appNumericId, $app['current_status']]);
        } catch (Exception $e) {
            // Non-critical, ignore if history table schema differs
        }

        return true;
    } catch (PDOException $e) {
        error_log("sync_loan_payment_success PDO error: " . $e->getMessage());
        return false;
    }
}
