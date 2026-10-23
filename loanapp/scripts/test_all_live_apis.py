import requests
import json
import time

BASE_URL = "https://rcrfinance.com/api"

print(f"=== TESTING ALL APIS ON LIVE HOST: {BASE_URL} ===\n")

results = []

def test_endpoint(name, method, path, headers=None, json_data=None, files=None, expected_status=[200, 201]):
    url = f"{BASE_URL}{path}"
    req_headers = {"Accept": "application/json"}
    if headers:
        req_headers.update(headers)
    start = time.time()
    try:
        if method == "GET":
            res = requests.get(url, headers=req_headers, timeout=15)
        elif method == "POST":
            res = requests.post(url, headers=req_headers, json=json_data, files=files, timeout=15)
        elif method == "PUT":
            res = requests.put(url, headers=req_headers, json=json_data, timeout=15)
        duration = round((time.time() - start) * 1000, 2)
        
        status = res.status_code
        passed = status in expected_status
        
        try:
            body = res.json()
        except Exception:
            body = res.text[:200]
            
        results.append({
            "name": name,
            "method": method,
            "path": path,
            "status": status,
            "passed": passed,
            "duration": duration,
            "response": body
        })
        
        mark = "PASS" if passed else "FAIL"
        print(f"[{mark}] {method} {path} -> {status} ({duration}ms)")
        if not passed:
            print(f"   Response: {body}\n")
        return res
    except Exception as e:
        results.append({
            "name": name,
            "method": method,
            "path": path,
            "status": 0,
            "passed": False,
            "duration": 0,
            "response": str(e)
        })
        print(f"[ERROR] {method} {path} -> Exception: {e}\n")
        return None

# 1. Public APIs
print("--- 1. Public Catalog & System Endpoints ---")
test_endpoint("Health Check", "GET", "/health")
test_endpoint("Catalog Categories", "GET", "/categories")
test_endpoint("Catalog Products", "GET", "/products")
test_endpoint("Product Detail", "GET", "/products/personal-express-loan")
test_endpoint("Eligibility Check", "POST", "/eligibility/check", json_data={
    "product_id": 1,
    "monthly_income": 45000,
    "existing_emi": 5000,
    "requested_amount": 50000,
    "requested_tenure_months": 24,
    "employment_type": "salaried",
    "credit_score_bracket": "good"
})

# 2. Customer Auth & Operations
print("\n--- 2. Customer Authentication & Application Lifecycle ---")
# Customer Login
cust_login = test_endpoint("Customer Login", "POST", "/auth/login", json_data={
    "login": "customer@rcrfinance.com",
    "password": "Customer@1234"
})

cust_token = None
if cust_login and cust_login.status_code == 200:
    cust_token = cust_login.json().get("token")
    print(f"   Customer Token Acquired.")

cust_headers = {"Authorization": f"Bearer {cust_token}"} if cust_token else {}

if cust_token:
    test_endpoint("Customer Auth Me", "GET", "/auth/me", headers=cust_headers)
    test_endpoint("Customer Dashboard", "GET", "/customer/dashboard", headers=cust_headers)
    test_endpoint("Customer Applications List", "GET", "/applications", headers=cust_headers)
    
    # Create Draft Application
    draft_res = test_endpoint("Create Loan Application Draft", "POST", "/applications/draft", headers=cust_headers, json_data={
        "product_id": 1,
        "requested_amount": 75000,
        "requested_tenure_months": 24,
        "purpose": "Home Renovation",
        "personal": {
            "first_name": "Test",
            "last_name": "Applicant",
            "email": "customer@rcrfinance.com",
            "phone": "9876543210",
            "dob": "1992-05-15",
            "gender": "male",
            "marital_status": "single",
            "current_address_line1": "123 Main Street",
            "current_city": "Mumbai",
            "current_state": "Maharashtra",
            "current_pincode": "400001",
            "pan_number": "ABCDE1234F",
            "aadhaar_number": "123456789012"
        },
        "financial": {
            "monthly_expenses": 15000,
            "existing_emi_obligations": 2000,
            "primary_bank_name": "HDFC Bank",
            "account_holder_name": "Test Applicant",
            "account_number": "5010023456789",
            "ifsc_code": "HDFC0001234"
        }
    })
    
    app_id = None
    if draft_res and draft_res.status_code in [200, 201]:
        app_id = draft_res.json().get("data", {}).get("id")
        print(f"   Created Application ID: {app_id}")
        
    if app_id:
        test_endpoint(f"Submit Application #{app_id}", "POST", f"/applications/{app_id}/submit", headers=cust_headers)
        test_endpoint(f"View Application #{app_id} (Auto Approve)", "GET", f"/applications/{app_id}?auto_approve=1", headers=cust_headers)
        test_endpoint(f"Accept Offer #{app_id}", "POST", f"/applications/{app_id}/offer/accept", headers=cust_headers)
        test_endpoint(f"Sign Agreement #{app_id}", "POST", f"/applications/{app_id}/formalities/sign", headers=cust_headers, json_data={"acknowledge_kfs": True, "acknowledge_agreement": True})
        test_endpoint(f"Initiate Payment for App #{app_id}", "POST", f"/applications/{app_id}/payment/initiate", headers=cust_headers, json_data={"payment_method": "upi_qr"})
        test_endpoint(f"Customer Repayment Schedule #{app_id}", "GET", f"/applications/{app_id}/repayment-schedule", headers=cust_headers)

# 3. Staff & Admin Operations
print("\n--- 3. Staff & Admin Endpoints ---")
admin_login = test_endpoint("Admin Login", "POST", "/auth/login", json_data={
    "login": "admin@rcrfinance.com",
    "password": "Admin@1234"
})

admin_token = None
if admin_login and admin_login.status_code == 200:
    admin_token = admin_login.json().get("token")
    print(f"   Admin Token Acquired.")

admin_headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}

if admin_token:
    test_endpoint("Admin Dashboard", "GET", "/staff/dashboard", headers=admin_headers)
    test_endpoint("Admin Applications Queue", "GET", "/staff/applications", headers=admin_headers)
    test_endpoint("Admin Customers 360", "GET", "/staff/customers", headers=admin_headers)
    test_endpoint("Admin Repayments Desk", "GET", "/staff/repayments", headers=admin_headers)
    test_endpoint("Admin Reports & Analytics", "GET", "/staff/reports", headers=admin_headers)
    test_endpoint("Admin Audit Logs", "GET", "/staff/audit-logs", headers=admin_headers)
    test_endpoint("Admin Team Members", "GET", "/staff/team", headers=admin_headers)
    test_endpoint("Admin Products List", "GET", "/staff/products", headers=admin_headers)
    
    if app_id:
        test_endpoint(f"Admin Show Application #{app_id}", "GET", f"/staff/applications/{app_id}", headers=admin_headers)
        test_endpoint(f"Admin Add Internal Note #{app_id}", "POST", f"/staff/applications/{app_id}/notes", headers=admin_headers, json_data={"note": "Automated system test note."})
        test_endpoint(f"Admin Info Request #{app_id}", "POST", f"/staff/applications/{app_id}/info-request", headers=admin_headers, json_data={"message": "Please confirm bank details."})
        test_endpoint(f"Admin Send Approved Ready for Disbursement #{app_id}", "POST", f"/staff/applications/{app_id}/quick-sanction-offer", headers=admin_headers, json_data={
            "approved_amount": 67500,
            "approved_tenure_months": 24,
            "interest_rate": 12.5,
            "processing_fee": 352.82,
            "remarks": "Approved and ready for disbursement."
        })
        test_endpoint(f"Admin Quick Verify & Disburse #{app_id}", "POST", f"/staff/applications/{app_id}/quick-verify-and-disburse", headers=admin_headers, json_data={
            "payout_reference": "NEFT-TEST-998877",
            "remarks": "Verified and disbursed."
        })
        test_endpoint(f"Admin Application Repayment Schedule #{app_id}", "GET", f"/staff/applications/{app_id}/repayment-schedule", headers=admin_headers)
        test_endpoint("Admin Toggle Product Status", "POST", "/staff/products/1/toggle", headers=admin_headers)
        test_endpoint("Admin Toggle Product Status Back", "POST", "/staff/products/1/toggle", headers=admin_headers)

# Summary
total = len(results)
passed_count = sum(1 for r in results if r["passed"])
failed_count = total - passed_count

print("\n" + "="*50)
print(f"TOTAL APIS TESTED: {total}")
print(f"PASSED: {passed_count}")
print(f"FAILED: {failed_count}")
print("="*50)

if failed_count > 0:
    print("\nFAILED ENDPOINTS:")
    for r in results:
        if not r["passed"]:
            print(f"- {r['method']} {r['path']} -> Status: {r['status']} | Response: {r['response']}")
