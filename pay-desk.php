<?php
/**
 * RCR Groups - Digital Verification & Client Billing Desk
 * Masked Payment Gateway Desk for External Services
 */

$app_id = trim($_GET['app_id'] ?? '');
$app_no = trim($_GET['app_no'] ?? ($app_id ? 'RCR-' . $app_id : 'INV-DOC-101'));
$amount = floatval($_GET['amount'] ?? 0);
$name = trim($_GET['name'] ?? '');
$email = trim($_GET['email'] ?? '');
$phone = trim($_GET['phone'] ?? '');
$return_url = trim($_GET['return_url'] ?? '');
$is_modal = (isset($_GET['modal']) && $_GET['modal'] === '1');

// Database Lookup: If customer details are missing or generic, fetch actual applicant details from loan database
if (!empty($app_id) || !empty($app_no)) {
    try {
        $loanDbHost = 'localhost';
        $loanDbName = 'u529002218_Loan1';
        $loanDbUser = 'u529002218_Loan1';
        $loanDbPass = 'Loan1@1234';

        $loanPdo = new PDO(
            "mysql:host={$loanDbHost};dbname={$loanDbName};charset=utf8mb4",
            $loanDbUser,
            $loanDbPass,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_SILENT,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );

        $stmt = $loanPdo->prepare("
            SELECT u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
                   p.full_name AS p_name, p.first_name AS p_first, p.last_name AS p_last, p.email AS p_email, p.phone AS p_phone
            FROM loan_applications a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN application_personal_details p ON a.id = p.application_id
            WHERE a.id = ? OR a.application_number = ?
            ORDER BY a.id DESC
            LIMIT 1
        ");
        $stmt->execute([$app_id, $app_no]);
        $custRow = $stmt->fetch();

        if ($custRow) {
            $pCombinedName = trim(($custRow['p_first'] ?? '') . ' ' . ($custRow['p_last'] ?? ''));
            $fetchedName = !empty($custRow['p_name']) ? $custRow['p_name'] : (!empty($pCombinedName) ? $pCombinedName : ($custRow['user_name'] ?? ''));
            $fetchedEmail = !empty($custRow['p_email']) ? $custRow['p_email'] : ($custRow['user_email'] ?? '');
            $fetchedPhone = !empty($custRow['p_phone']) ? $custRow['p_phone'] : ($custRow['user_phone'] ?? '');

            if (empty($name) || $name === 'Customer') {
                $name = $fetchedName ?: $name;
            }
            if (empty($email) || $email === 'customer@rcrgroups.shop' || $email === 'service@rcrgroups.shop') {
                $email = $fetchedEmail ?: $email;
            }
            if (empty($phone) || $phone === '9588746801') {
                $phone = $fetchedPhone ?: $phone;
            }
        }
    } catch (\Exception $e) {
        // Fallback gracefully
    }
}

// Final fallbacks if no data at all
if (empty($name)) {
    $name = 'Customer';
}
if (empty($email)) {
    $email = 'service@rcrgroups.shop';
}
if (empty($phone)) {
    $phone = '9588746801';
}

// Allow embedding inside official loan application modal
header_remove('X-Frame-Options');
header("Content-Security-Policy: frame-ancestors 'self' https://rcrfinance.com https://*.rcrfinance.com https://antiquewhite-fish-888897.hostingersite.com http://localhost:*;");

// Default sample amount if none provided
if ($amount <= 0) {
    $amount = 1.00;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digital Verification Desk - RCR Groups</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <!-- Cashfree Payment Gateway Official JS SDK v3 -->
  <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
  <style>
    body {
      background: <?php echo $is_modal ? '#0f172a' : '#090d16'; ?>;
      color: #f8fafc;
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: <?php echo $is_modal ? '100%' : '100vh'; ?>;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin: 0;
      padding: 0;
    }
    .desk-container {
      max-width: 520px;
      margin: <?php echo $is_modal ? '0 auto' : '40px auto'; ?>;
      padding: <?php echo $is_modal ? '12px' : '0 20px'; ?>;
      width: 100%;
      box-sizing: border-box;
    }
    .desk-card {
      background: rgba(17, 24, 39, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: <?php echo $is_modal ? '20px' : '24px'; ?>;
      padding: <?php echo $is_modal ? '22px 18px' : '32px 28px'; ?>;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(20px);
      position: relative;
      overflow: hidden;
    }
    .desk-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, #4f46e5, #06b6d4, #10b981);
    }
    .brand-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      font-size: 1.15rem;
      color: #fff;
    }
    .invoice-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
      padding: 4px 10px;
      border-radius: 999px;
      font-weight: 600;
    }
    .desk-title {
      font-size: 1.35rem;
      font-weight: 800;
      margin-bottom: 6px;
      color: #fff;
    }
    .desk-subtitle {
      font-size: 0.85rem;
      color: #94a3b8;
      margin-bottom: 24px;
      line-height: 1.4;
    }
    .summary-box {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 24px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 0.88rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .summary-row:last-child {
      border-bottom: none;
      padding-top: 12px;
      margin-top: 4px;
    }
    .summary-label {
      color: #94a3b8;
    }
    .summary-val {
      color: #f1f5f9;
      font-weight: 600;
      text-align: right;
    }
    .amount-val {
      font-size: 1.45rem;
      font-weight: 800;
      color: #10b981;
      font-family: 'JetBrains Mono', monospace;
    }
    .pay-btn {
      width: 100%;
      background: linear-gradient(135deg, #4f46e5, #4338ca);
      color: #fff;
      font-size: 1.05rem;
      font-weight: 700;
      padding: 16px 20px;
      border-radius: 14px;
      border: none;
      cursor: pointer;
      box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.5);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .pay-btn:hover {
      background: linear-gradient(135deg, #4338ca, #3730a3);
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -5px rgba(79, 70, 229, 0.7);
    }
    .pay-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }
    .trust-strip {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 20px;
      font-size: 0.75rem;
      color: #64748b;
    }
    @media (max-width: 640px) {
      body {
        background: #090d16;
        padding: 0;
      }
      .desk-container {
        padding: 12px 10px;
        margin: 0 auto;
        max-width: 100%;
      }
      .desk-card {
        border-radius: 20px;
        padding: 20px 16px;
      }
    }
  </style>
</head>
<body>

  <div class="desk-container">
    <?php if (!empty($return_url)): ?>
    <div style="margin-bottom: 14px;">
      <a href="<?php echo htmlspecialchars($return_url); ?>" style="display: inline-flex; align-items: center; gap: 6px; color: #94a3b8; text-decoration: none; font-size: 0.85rem; font-weight: 700; background: rgba(255,255,255,0.06); padding: 8px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s;">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        <span>Back to Application</span>
      </a>
    </div>
    <?php endif; ?>

    <div class="desk-card">
      <div class="brand-header">
        <div class="brand-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          <span>RCR <strong>Groups</strong></span>
        </div>
        <span class="invoice-badge"><?php echo htmlspecialchars($app_no); ?></span>
      </div>

      <h1 class="desk-title">Digital Verification & Stamping</h1>
      <p class="desk-subtitle">Authorized digital documentation processing desk for application ref <strong>#<?php echo htmlspecialchars($app_no); ?></strong>.</p>

      <div class="summary-box">
        <div class="summary-row">
          <span class="summary-label">Client Name:</span>
          <span class="summary-val"><?php echo htmlspecialchars($name); ?></span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Contact Mobile:</span>
          <span class="summary-val font-mono">+91 <?php echo htmlspecialchars(substr(preg_replace('/[^0-9]/', '', $phone), -10)); ?></span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Service Package:</span>
          <span class="summary-val" style="color: #a5b4fc;">Digital Document Verification & Agreement Stamping</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Authorization:</span>
          <span class="summary-val" style="color: #10b981;">Instant Auto-Verification</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Total Payable:</span>
          <span class="summary-val amount-val">₹<?php echo number_format($amount, 2); ?></span>
        </div>
      </div>

      <button type="button" class="pay-btn" id="launchPayBtn" onclick="initiatePayment()">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        <span>Proceed to Pay ₹<?php echo number_format($amount, 2); ?> via Cashfree</span>
      </button>

      <div class="trust-strip">
        <div class="trust-item">
          <svg width="14" height="14" fill="#10b981" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          Cashfree Verified
        </div>
        <div class="trust-item">
          <svg width="14" height="14" fill="#38bdf8" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
          256-Bit SSL Secured
        </div>
        <div class="trust-item">
          ⚡ UPI / Cards / NetBanking
        </div>
      </div>
    </div>
  </div>

  <footer style="text-align: center; padding: 20px; color: #64748b; font-size: 0.8rem;">
    &copy; <?php echo date('Y'); ?> RCR Groups. All rights reserved. Secured by Cashfree Payments India Pvt Ltd.
  </footer>

  <script>
    const orderData = {
      name: <?php echo json_encode($name); ?>,
      email: <?php echo json_encode($email); ?>,
      phone: <?php echo json_encode($phone); ?>,
      template_id: 'rcr-doc-verification',
      template_title: <?php echo json_encode('Digital Verification Package #' . $app_no); ?>,
      amount: <?php echo floatval($amount); ?>,
      loan_app_id: <?php echo json_encode($app_id); ?>,
      return_app_url: <?php echo json_encode($return_url); ?>,
      modal: <?php echo $is_modal ? '1' : '0'; ?>
    };

    let cashfreeInstance = null;
    function getCashfree() {
      if (!cashfreeInstance && typeof Cashfree !== 'undefined') {
        cashfreeInstance = Cashfree({ mode: "production" });
      }
      return cashfreeInstance;
    }

    async function initiatePayment() {
      const btn = document.getElementById('launchPayBtn');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `
        <svg style="animation: spin 1s linear infinite; width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor" stroke-dasharray="32" stroke-linecap="round"></circle>
        </svg>
        Connecting to Cashfree Gateway...
      `;

      try {
        const response = await fetch('api/create-order.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.payment_session_id) {
          throw new Error(data.message || 'Failed to initialize Cashfree payment session.');
        }

        const cf = getCashfree();
        if (cf) {
          btn.innerHTML = `<span>Opening Cashfree Checkout...</span>`;
          cf.checkout({
            paymentSessionId: data.payment_session_id,
            redirectTarget: "_self"
          });
        } else {
          throw new Error('Cashfree Payment SDK failed to load. Please check your internet connection.');
        }
      } catch (err) {
        alert(err.message || 'Payment initiation failed. Please try again.');
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }

    // Auto-launch checkout after 800ms for smooth 1-tap UX
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        const cf = getCashfree();
        if (cf) {
          // Pre-load SDK instance
        }
      }, 500);
    });
  </script>
</body>
</html>
