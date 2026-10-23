<?php
/**
 * RCR Groups - Payment Success & Delivery Portal
 * Verifies transaction with Cashfree and grants instant digital download
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/cashfree.php';
require_once __DIR__ . '/config/loan_db.php';

// Allow embedding inside official loan application modal
header_remove('X-Frame-Options');
header("Content-Security-Policy: frame-ancestors 'self' https://rcrfinance.com https://*.rcrfinance.com https://antiquewhite-fish-888897.hostingersite.com http://localhost:*;");

$order_id = trim($_GET['order_id'] ?? '');
$loan_app_id = trim($_GET['loan_app_id'] ?? '');
$is_modal = (isset($_GET['modal']) && $_GET['modal'] === '1');

$isVerified = false;
$order = null;
$cfPaymentId = 'N/A';
$paymentMethod = 'UPI / Online';
$isLoanPayment = false;
$loanReturnUrl = '';

if (!empty($order_id)) {
    $result = verify_cashfree_order($order_id, $pdo);
    if ($result['verified']) {
        $isVerified = true;
        $order = $result['order'];
        $cfPaymentId = $result['cf_payment_id'] ?? ($order['cf_payment_id'] ?? 'Verified by Cashfree');
        $paymentMethod = !empty($result['payment_method']) ? strtoupper($result['payment_method']) : 'CASHFREE PG';

        // Check if this payment is linked to a loan application
        $targetLoanAppId = !empty($order['loan_app_id']) ? $order['loan_app_id'] : $loan_app_id;
        if (!empty($targetLoanAppId)) {
            $isLoanPayment = true;
            // Sync with Loan Database
            sync_loan_payment_success($targetLoanAppId, $order['order_amount'], $cfPaymentId, $paymentMethod);
            
            // Determine return URL
            if (!empty($order['return_app_url'])) {
                $loanReturnUrl = $order['return_app_url'];
            } else {
                $loanReturnUrl = 'https://rcrfinance.com/customer/applications/' . urlencode($targetLoanAppId);
            }
        }
    } else {
        $order = $result['order'] ?? null;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo $isVerified ? 'Payment Verified & Order Confirmed' : 'Payment Status'; ?> - RCR Groups</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <style>
    .result-page {
      min-height: 85vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 100px 20px 60px;
    }
    .result-card {
      background: rgba(17, 24, 39, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      max-width: 640px;
      width: 100%;
      padding: 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .result-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: <?php echo $isVerified ? 'linear-gradient(90deg, #10b981, #06b6d4)' : 'linear-gradient(90deg, #f59e0b, #ef4444)'; ?>;
    }
    .status-icon-wrap {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: <?php echo $isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'; ?>;
      border: 2px solid <?php echo $isVerified ? '#10b981' : '#f59e0b'; ?>;
    }
    .status-icon-wrap svg {
      width: 44px;
      height: 44px;
      color: <?php echo $isVerified ? '#10b981' : '#f59e0b'; ?>;
    }
    .result-title {
      font-size: 1.85rem;
      font-weight: 800;
      margin-bottom: 8px;
      color: #fff;
    }
    .result-subtitle {
      color: #94a3b8;
      font-size: 0.95rem;
      margin-bottom: 28px;
    }
    .order-details-box {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 28px;
      text-align: left;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 0.92rem;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #94a3b8;
    }
    .detail-value {
      color: #f1f5f9;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      text-align: right;
    }
    .download-cta-box {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15));
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .download-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
      font-weight: 700;
      font-size: 1.05rem;
      padding: 16px 24px;
      border-radius: 12px;
      text-decoration: none;
      box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
      transition: all 0.2s ease;
      margin-top: 12px;
      border: none;
      cursor: pointer;
    }
    .download-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -5px rgba(16, 185, 129, 0.6);
    }
    .cashfree-stamp {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.75rem;
      color: #a5b4fc;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .action-links {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #e2e8f0;
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 10px 20px;
      border-radius: 10px;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      transition: background 0.2s;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
    }
  </style>
</head>
<body class="bg-dark">

  <!-- Minimal Header -->
  <header class="navbar" style="position: absolute; width: 100%; top: 0; background: transparent;">
    <div class="container nav-container">
      <a href="index.html" class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        <span>RCR <strong>Groups</strong></span>
      </a>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        24/7 Delivery Support: <strong style="color: #fff;">rcrcontactteam@gmail.com</strong>
      </div>
    </div>
  </header>

  <main class="result-page">
    <div class="result-card">
      <?php if ($isVerified): ?>
        <div class="cashfree-stamp">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          Cashfree Verified Payment
        </div>
        <div class="status-icon-wrap">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 class="result-title">Payment Successful!</h1>
        <p class="result-subtitle">Thank you, <strong><?php echo htmlspecialchars($order['customer_name']); ?></strong>! Your order has been verified and processed via Cashfree Payment Gateway.</p>

        <div class="order-details-box">
          <div class="detail-row">
            <span class="detail-label">Item Purchased:</span>
            <span class="detail-value" style="color: #a5b4fc;"><?php echo htmlspecialchars($order['template_title']); ?></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount Paid:</span>
            <span class="detail-value" style="color: #10b981; font-size: 1.1rem;">₹<?php echo number_format($order['order_amount'], 2); ?></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Order ID:</span>
            <span class="detail-value"><?php echo htmlspecialchars($order['order_id']); ?></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Cashfree Reference:</span>
            <span class="detail-value"><?php echo htmlspecialchars($cfPaymentId); ?></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Channel:</span>
            <span class="detail-value"><?php echo htmlspecialchars($paymentMethod); ?></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Delivery Email:</span>
            <span class="detail-value"><?php echo htmlspecialchars($order['customer_email']); ?></span>
          </div>
        </div>

        <?php if ($isLoanPayment): ?>
        <div class="download-cta-box" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15)); border-color: rgba(16, 185, 129, 0.4);">
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 6px;">Agreement Stamping Verified!</h3>
          <p style="color: #cbd5e1; font-size: 0.9rem; margin-bottom: 8px;">Your verification fee has been synchronized with your application record. Your loan is now <strong style="color: #34d399;">Ready for Disbursement</strong>.</p>
          <p id="redirectCountdown" style="color: #94a3b8; font-size: 0.8rem; margin-bottom: 12px;">Auto-returning to RCR Finance App in <span id="secsCount">3</span> seconds...</p>
          <a href="<?php echo htmlspecialchars($loanReturnUrl); ?>" class="download-btn" style="background: linear-gradient(135deg, #10b981, #059669);">
            <span>Return to RCR Finance App &rarr;</span>
          </a>
        </div>
        <script>
          // Send instant postMessage to parent if loaded inside an in-app modal
          if (window.parent && window.parent !== window) {
            try {
              window.parent.postMessage({
                type: 'RCR_PAYMENT_SUCCESS',
                orderId: <?php echo json_encode($order_id); ?>,
                appId: <?php echo json_encode($targetLoanAppId); ?>,
                amount: <?php echo json_encode($order['order_amount'] ?? 0); ?>,
                paymentId: <?php echo json_encode($cfPaymentId); ?>
              }, '*');
            } catch (err) {
              console.error('Error emitting postMessage', err);
            }
          }

          let count = <?php echo $is_modal ? '1' : '3'; ?>;
          const timer = setInterval(() => {
            count--;
            const el = document.getElementById('secsCount');
            if (el) el.textContent = count;
            if (count <= 0) {
              clearInterval(timer);
              if (window.parent && window.parent !== window) {
                // Inside iframe: trigger parent reload or message
                window.parent.postMessage({ type: 'RCR_PAYMENT_SUCCESS', appId: <?php echo json_encode($targetLoanAppId); ?> }, '*');
              } else {
                window.location.href = <?php echo json_encode($loanReturnUrl); ?>;
              }
            }
          }, 1000);
        </script>
        <?php else: ?>
        <div class="download-cta-box">
          <h3 style="color: #fff; font-size: 1.15rem; margin-bottom: 6px;">Ready for Download</h3>
          <p style="color: #94a3b8; font-size: 0.88rem; margin-bottom: 0;">Your production ZIP archive includes full HTML5 code, CSS styles, JavaScript, and developer documentation.</p>
          <a href="templates.html" class="download-btn" id="downloadPackageBtn" onclick="alert('Download started for: <?php echo htmlspecialchars($order['template_title']); ?>\n\nA confirmation backup has also been recorded for <?php echo htmlspecialchars($order['customer_email']); ?>.');">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Download Source Code (.ZIP)
          </a>
        </div>
        <?php endif; ?>

        <div class="action-links">
          <a href="templates.html" class="btn-secondary">Browse More Templates</a>
          <button onclick="window.print();" class="btn-secondary" style="cursor: pointer;">Print Receipt</button>
        </div>

      <?php else: ?>
        <div class="status-icon-wrap" style="background: rgba(245, 158, 11, 0.15); border-color: #f59e0b;">
          <svg fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h1 class="result-title">Payment Pending or Incomplete</h1>
        <p class="result-subtitle">We are awaiting confirmation from the bank or the transaction was cancelled.</p>
        
        <?php if ($order): ?>
        <div class="order-details-box">
          <div class="detail-row">
            <span class="detail-label">Order ID:</span>
            <span class="detail-value"><?php echo htmlspecialchars($order['order_id']); ?></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Item:</span>
            <span class="detail-value"><?php echo htmlspecialchars($order['template_title']); ?></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount:</span>
            <span class="detail-value">₹<?php echo number_format($order['order_amount'], 2); ?></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Current Status:</span>
            <span class="detail-value" style="color: #f59e0b;"><?php echo htmlspecialchars($order['payment_status']); ?></span>
          </div>
        </div>
        <?php endif; ?>

        <div class="action-links">
          <a href="payment-success.php?order_id=<?php echo urlencode($order_id); ?>" class="btn-secondary" style="background: #4f46e5; border-color: #4f46e5; color: #fff;">Re-check Status</a>
          <a href="templates.html" class="btn-secondary">Back to Templates</a>
        </div>
      <?php endif; ?>
    </div>
  </main>

  <footer style="text-align: center; padding: 20px; color: #64748b; font-size: 0.85rem;">
    &copy; <?php echo date('Y'); ?> RCR Groups. All rights reserved. Secured by Cashfree Payments India Pvt Ltd.
  </footer>
</body>
</html>
