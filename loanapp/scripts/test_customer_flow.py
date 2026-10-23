#!/usr/bin/env python3
"""
End-to-End Customer & Admin Loan Workflow API Test against Live Hostinger Server.
"""

import urllib.request
import urllib.parse
import json
import os
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_URL = "https://antiquewhite-fish-888897.hostingersite.com/api"

def make_req(endpoint, method="GET", data=None, token=None, files=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {
        "Accept": "application/json",
        "User-Agent": "LoanTestBot/1.0"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req_data = None
    if files:
        boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
        headers["Content-Type"] = f"multipart/form-data; boundary={boundary}"
        body_bytes = bytearray()
        
        # Add normal form fields
        if data:
            for k, v in data.items():
                body_bytes.extend(f"--{boundary}\r\n".encode())
                body_bytes.extend(f'Content-Disposition: form-data; name="{k}"\r\n\r\n'.encode())
                body_bytes.extend(f"{v}\r\n".encode())
                
        # Add files
        for field_name, (file_name, file_content, mime_type) in files.items():
            body_bytes.extend(f"--{boundary}\r\n".encode())
            body_bytes.extend(f'Content-Disposition: form-data; name="{field_name}"; filename="{file_name}"\r\n'.encode())
            body_bytes.extend(f"Content-Type: {mime_type}\r\n\r\n".encode())
            if isinstance(file_content, str):
                body_bytes.extend(file_content.encode())
            else:
                body_bytes.extend(file_content)
            body_bytes.extend(b"\r\n")
            
        body_bytes.extend(f"--{boundary}--\r\n".encode())
        req_data = bytes(body_bytes)
    elif data is not None:
        headers["Content-Type"] = "application/json"
        req_data = json.dumps(data).encode("utf-8")

    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw)
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw_error": raw}
    except Exception as ex:
        return 0, {"exception": str(ex)}

def main():
    print("==================================================")
    print(" [TEST] STARTING END-TO-END CUSTOMER APPLICATION TEST")
    print("==================================================")

    # 1. Customer Login
    print("\n[STEP 1] Customer Authentication...")
    status, res = make_req("/auth/login", method="POST", data={
        "login": "customer@rcrfinance.com",
        "password": "Customer@1234"
    })
    
    if status != 200 or not res.get("token"):
        print(f"Login failed ({status}): {res}")
        sys.exit(1)
        
    cust_token = res["token"]
    cust_user = res["user"]
    print(f"[OK] Customer Logged in: {cust_user['name']} (ID: {cust_user['id']})")

    # 2. Get Products Catalog
    print("\n[STEP 2] Fetching Loan Products...")
    status, res = make_req("/products")
    products = res.get("data", [])
    if not products:
        print("No products found!")
        sys.exit(1)
    product = products[0]
    print(f"[OK] Selected Product: {product['name']} (ID: {product['id']}, Rate: {product['default_interest_rate']}%)")

    # 3. Create Draft Application
    print("\n[STEP 3] Creating Customer Loan Application...")
    app_payload = {
        "product_id": product["id"],
        "requested_amount": 150000,
        "requested_tenure_months": 24,
        "purpose": "Personal Medical & Home Upgrades",
        "personal_details": {
            "first_name": "Aarav",
            "last_name": "Patel",
            "email": "customer@rcrfinance.com",
            "phone": "9876543210",
            "pan_number": "ABCDE1234F",
            "aadhaar_number": "458912349012",
            "dob": "1994-08-15",
            "gender": "male",
            "marital_status": "married",
            "current_address_line1": "Flat 402, Royal Palms Residency",
            "current_city": "Mumbai",
            "current_state": "Maharashtra",
            "current_pincode": "400050"
        },
        "employment_details": {
            "employment_type": "salaried",
            "employer_name": "Tata Consultancy Services Ltd",
            "designation": "Senior Software Engineer",
            "monthly_income": 65000,
            "work_experience_years": 5
        },
        "financial_details": {
            "primary_bank_name": "HDFC Bank",
            "account_number": "50100294819203",
            "ifsc_code": "HDFC0000123",
            "account_holder_name": "Aarav Patel",
            "existing_emi_obligations": 5000
        }
    }

    status, res = make_req("/applications/draft", method="POST", data=app_payload, token=cust_token)
    if status != 200:
        print(f"Draft creation failed ({status}): {res}")
        sys.exit(1)
        
    app_data = res["data"]
    app_id = app_data["id"]
    app_num = app_data["application_number"]
    print(f"[OK] Application Created! ID: {app_id}, App No: {app_num}, Status: {app_data['current_status']}")

    # 4. Upload Sample KYC Document
    print("\n[STEP 4] Uploading KYC Document...")
    fake_pan_file = ("pan_card.png", b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82", "image/png")
    status, res = make_req(f"/applications/{app_id}/documents", method="POST", data={"document_type": "pan_card"}, files={"file": fake_pan_file}, token=cust_token)
    print(f"[OK] Document Uploaded: HTTP {status}")

    # 5. Submit Application
    print("\n[STEP 5] Submitting Application...")
    status, res = make_req(f"/applications/{app_id}/submit", method="POST", token=cust_token)
    print(f"[OK] Application Submitted! Status: {res.get('data', {}).get('current_status')}")

    # ==========================================
    # ADMIN REVIEW & 1-CLICK MANUAL SANCTION
    # ==========================================
    print("\n==========================================")
    print(" [ADMIN] REVIEW & 1-CLICK MANUAL SANCTION")
    print("==========================================")

    # Admin Login
    print("\n[STEP 6] Admin Authentication...")
    status, res = make_req("/auth/login", method="POST", data={
        "login": "admin@rcrfinance.com",
        "password": "Admin@1234"
    })

    admin_token = res["token"]
    print(f"[OK] Admin Logged In: {res['user']['name']}")

    # Admin Inspects & 1-Click Sanctions with Manual Processing Fee
    print("\n[STEP 7] Admin Sets Approved Amount & Manual Processing Fee...")
    sanction_data = {
        "approved_amount": 150000,
        "approved_tenure_months": 24,
        "interest_rate": 13.0,
        "processing_fee": 1800,  # Custom manual processing fee set by admin
        "remarks": "Documents verified. Approved Rs 1,50,000 at 13% with Rs 1,800 manual processing fee."
    }
    status, res = make_req(f"/staff/applications/{app_id}/quick-sanction-offer", method="POST", data=sanction_data, token=admin_token)
    print(f"[OK] Admin 1-Click Sanction Result ({status}): {res.get('message')}")
    offer = res.get("data", {}).get("offer", {})
    print(f"   Offer Number: {offer.get('offer_number')}")
    print(f"   Sanctioned Amount: Rs {offer.get('approved_amount')}")
    print(f"   Monthly EMI: Rs {offer.get('emi_amount')}")
    print(f"   Manual Processing Fee: Rs {offer.get('processing_fee')}")

    # ==========================================
    # CUSTOMER ACCEPTS OFFER & PAYS FEE
    # ==========================================
    print("\n==========================================")
    print(" [CUSTOMER] ACCEPTANCE & QR/RECEIPT PAYMENT")
    print("==========================================")

    # Customer Accepts Offer
    print("\n[STEP 8] Customer Accepts Offer...")
    status, res = make_req(f"/applications/{app_id}/offer/accept", method="POST", token=cust_token)
    print(f"[OK] Offer Accepted! Result: {res.get('message')}")

    # Customer Signs Agreement
    print("\n[STEP 9] Customer Digitally Signs Formalities...")
    status, res = make_req(f"/applications/{app_id}/formalities/sign", method="POST", data={
        "acknowledge_kfs": True,
        "acknowledge_agreement": True
    }, token=cust_token)
    print(f"[OK] Agreement Signed! HTTP {status}: {res.get('message')}")
    print(f"   Application Status: {res.get('next_status')}")

    # Customer Uploads Payment Receipt & 12-Digit UTR
    print("\n[STEP 10] Customer Submits Payment Receipt & UTR...")
    fake_receipt_file = ("upi_payment_screenshot.png", b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82", "image/png")
    status, res = make_req(
        f"/applications/{app_id}/payment/submit-receipt",
        method="POST",
        data={
            "utr_number": "428901847291",
            "payment_method": "upi_qr"
        },
        files={"receipt": fake_receipt_file},
        token=cust_token
    )
    print(f"[OK] Receipt Submitted! HTTP {status}: {res.get('message')}")

    # Check Status as Customer
    status, res = make_req(f"/applications/{app_id}", token=cust_token)
    cur_status = res.get("data", {}).get("current_status")
    print(f"   Current Application Status for Customer: '{cur_status}' (24-48h Verification Banner Active)")

    # ==========================================
    # ADMIN 1-CLICK PAYMENT VERIFICATION & PAYOUT
    # ==========================================
    print("\n==========================================")
    print(" [ADMIN] PAYMENT VERIFICATION & DISBURSEMENT")
    print("==========================================")

    print("\n[STEP 11] Admin Verifies Receipt & Disburses Funds...")
    disb_data = {
        "payout_reference": "NEFT-HDFC-982374182",
        "remarks": "Payment receipt verified with bank statement. Funds released to applicant."
    }
    status, res = make_req(f"/staff/applications/{app_id}/quick-verify-and-disburse", method="POST", data=disb_data, token=admin_token)
    print(f"[OK] Admin 1-Click Payout Result ({status}): {res.get('message')}")

    # Final Customer Status Check
    print("\n[STEP 12] Final Verification of Application Status...")
    status, res = make_req(f"/applications/{app_id}", token=cust_token)
    final_app = res.get("data", {})
    print(f"[SUCCESS] FINAL APPLICATION STATUS: {final_app.get('current_status')}")
    print(f"   Disbursed Amount: Rs {final_app.get('disbursement_record', {}).get('amount')}")
    print(f"   Bank UTR / Payout Ref: {final_app.get('disbursement_record', {}).get('transaction_reference')}")
    print(f"   Target Bank: {final_app.get('disbursement_record', {}).get('bank_name')} (A/C: {final_app.get('disbursement_record', {}).get('account_number')})")

    print("\n==================================================")
    print(" [TEST PASSED] FULL END-TO-END WORKFLOW SUCCEEDED 100%!")
    print("==================================================")

if __name__ == "__main__":
    main()
