# Google Play Store Release Guide — RCR Finance

Everything required to publish **RCR Finance** on the Google Play Store has been prepared and compiled in this folder: `d:\rcrweb\playstore_release\`.

---

## 📦 Release Folder Contents

| File | Purpose |
|---|---|
| **`app-release.aab`** | **Android App Bundle (.aab)** — This is the primary file you upload to **Google Play Console** under Production / Closed Testing. |
| **`rcr_finance-release.apk`** | **Signed Release APK (.apk)** — Ready for direct Android testing, internal distribution, or sharing with team members. |
| **`rcrfinance-release-key.jks`** | **Production Release Keystore** — Cryptographic private key used to sign your app. **Keep this backed up safely!** |
| **`KEYSTORE_CREDENTIALS.txt`** | Complete key passwords, alias, validity date (2054), and SHA-1 / SHA-256 fingerprints. |
| **`PLAYSTORE_RELEASE_CHECKLIST.md`** | This step-by-step release guide. |

---

## 🚀 Step-by-Step Google Play Console Submission

### Step 1: Open Google Play Console
1. Navigate to: **[https://play.google.com/console](https://play.google.com/console)**
2. Sign in with your registered Google Play Developer account.

---

### Step 2: Create App
1. Click **Create app** (top-right button).
2. Fill in the basic details:
   - **App name:** `RCR Finance`
   - **Default language:** `English (United States)` or `English (India)`
   - **App or game:** `App`
   - **Free or paid:** `Free`
3. Accept the **Developer Program Policies** and click **Create app**.

---

### Step 3: Complete "Set up your app" (App Content Declarations)
In the left sidebar, scroll down to **Policy and programs** > **App content**. Complete each section:

1. **Privacy policy:**
   - URL: `https://rcrfinance.com/privacy-policy`
2. **App access:**
   - Select: *All functionality is available without special access*, or provide a test login if testing behind authentication.
3. **Ads:**
   - Select: *No, my app does not contain ads*.
4. **Content ratings:**
   - Complete the questionnaire. Category: *Utility, Productivity, Communication, or other*. Result will be **Everyone / 3+**.
5. **Target audience and content:**
   - Target age: *18 and over*.
6. **News apps:**
   - Select: *No*.
7. **COVID-19 contact tracing & status apps:**
   - Select: *My app is not a COVID-19 contact tracing or status app*.
8. **Data safety:**
   - *Does your app collect or share data?* **Yes**
   - *Is all user data encrypted in transit?* **Yes (HTTPS / 256-bit SSL)**
   - *Do you provide a way for users to request data deletion?* **Yes** (`https://rcrfinance.com/delete-account`)
   - **Data types collected:**
     - *Personal info:* Name, Email address, Phone number, Address, Government ID (PAN/Aadhaar for KYC).
     - *Financial info:* Bank account number / UPI details (for loan disbursement and EMI repayments).
   - *Data usage:* App functionality, fraud prevention, account management.
9. **Financial features declaration (India):**
   - Category: *Personal loans / Facilitator*.
   - Declare partnering RBI-registered NBFC / lending entity details as disclosed in your footer & statutory policies.
10. **Government apps:**
    - Select: *No*.

---

### Step 4: Set up Main Store Listing
Navigate to **Grow** > **Store presence** > **Main store listing**:

1. **App details:**
   - **App name:** `RCR Finance - Instant Loans`
   - **Short description (up to 80 chars):**
     `Instant digital personal loans & MSME business credit with zero paperwork.`
   - **Full description (up to 4000 chars):**
     ```text
     Welcome to RCR Finance – India's fast, transparent, and reliable digital lending platform.

     Whether you need urgent emergency funds, personal express credit for medical expenses, or working capital to expand your business, RCR Finance delivers instant decisions and prompt bank disbursals.

     KEY FEATURES:
     • Fast Digital Processing: 100% paperless application with quick eligibility check.
     • Transparent Pricing: Clear APR, zero hidden pre-closure penalties, and flexible tenure from 3 to 60 months.
     • MSME & Business Growth Loans: Collateral-free working capital solutions for retailers, entrepreneurs, and traders.
     • Instant EMI & Loan Tracking: Real-time dashboard to monitor active loans, track EMI due dates, and view sanction letters.
     • 256-Bit SSL Security: Industry-grade bank encryption ensuring your personal and financial information remains strictly confidential.

     REPRESENTATIVE EXAMPLE:
     • Loan Amount: ₹1,00,000
     • Tenure: 12 Months
     • Interest Rate: 12% p.a.
     • Monthly EMI: ₹8,885
     • Total Payable: ₹1,06,620

     Customer Support: rcrcontactteam@gmail.com
     Office Address: Rcr finance 1032 JMD Tower shona road guargon Haryana PIN 122001
     Website: https://rcrfinance.com
     ```

2. **Graphics & Assets:**
   - **App Icon:** `512 x 512 px` (32-bit PNG with alpha). *You can use the app logo from `loanapp/android/app/src/main/res/drawable/app_logo.png`*.
   - **Feature Graphic:** `1024 x 500 px` (JPG or 24-bit PNG).
   - **Phone Screenshots:** At least 2 screenshots (16:9 or 9:16 aspect ratio, min 1080px).

---

### Step 5: Upload AAB and Release

1. In the left menu, go to **Release** > **Production** (or **Internal testing** if you want to test first with a small team).
2. Click **Create new release**.
3. Under **App bundles**, click **Upload** and select:
   ```
   d:\rcrweb\playstore_release\app-release.aab
   ```
4. Google Play will analyze the bundle:
   - **Target SDK:** 35 (Android 15) ✅
   - **Permissions:** Compliant with Google Play Personal Loans Policy ✅
   - **Signature:** Signed with `rcrfinance` release key ✅
5. **Release name:** `1.0 (1)`
6. **Release notes:**
   ```text
   Initial launch of the official RCR Finance Android app. Apply for instant personal and MSME business loans, track EMI repayments, and manage your account securely.
   ```
7. Click **Next**, review the release summary, and click **Save**.
8. Click **Start rollout to Production** to submit your app for Google Play review!
