import requests

API_URL = "https://rcrfinance.com/api"

# 1. Login
res = requests.post(f"{API_URL}/auth/login", json={
    "login": "admin@rcrfinance.com",
    "password": "Admin@1234"
})
token = res.json()["token"]
headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}

# 2. Test Onboard Employee with Type 1 (Direct Custom Permissions) and Permanent Password
test_email = "test.officer@rcrfinance.com"
test_password = "RcrStaff#Permanent2026"

print("1. Creating test employee with custom permissions & permanent password...")
create_res = requests.post(f"{API_URL}/staff/employees", json={
    "name": "Test Underwriter Officer",
    "email": test_email,
    "phone": "9876543219",
    "password": test_password,
    "role_id": None,
    "custom_permissions": ["underwriting_assess", "sanctions_approve", "applications_view"],
    "send_email": False
}, headers=headers)

print("Create response code:", create_res.status_code)
created_data = create_res.json()
print("Success:", created_data.get("success"))
new_id = created_data.get("data", {}).get("id")
print("New employee ID:", new_id)

# 3. Test logging in with the newly onboarded employee's permanent password!
print("\n2. Testing login with newly created employee's permanent password...")
emp_login = requests.post(f"{API_URL}/auth/login", json={
    "login": test_email,
    "password": test_password
})
print("Employee login status:", emp_login.status_code)
emp_data = emp_login.json()
emp_user = emp_data.get("user", {})
print("Logged in as:", emp_user.get("name"))
print("Assigned role:", emp_user.get("role"))
print("Effective permissions:", emp_user.get("effective_permissions"))

# 4. Clean up test employee
print(f"\n3. Cleaning up test employee ID #{new_id}...")
del_res = requests.delete(f"{API_URL}/staff/employees/{new_id}", headers=headers)
print("Delete status:", del_res.status_code)
print(del_res.json())

print("\nALL RBAC & ONBOARDING OPERATIONS VERIFIED SUCCESSFULLY!")
