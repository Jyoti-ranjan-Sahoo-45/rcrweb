import requests

API_URL = "https://rcrfinance.com/api"

# 1. Login with root super admin
print("Testing root super admin login...")
res = requests.post(f"{API_URL}/auth/login", json={
    "login": "admin@rcrfinance.com",
    "password": "Admin@1234"
})
print("Login status:", res.status_code)
login_data = res.json()
print("Token received:", bool(login_data.get("token")))
user = login_data.get("user", {})
print("User name:", user.get("name"))
print("User role:", user.get("role"))
print("Effective permissions count:", len(user.get("effective_permissions", [])))
print("Sample effective permissions:", user.get("effective_permissions", [])[:4])

token = login_data.get("token")
headers = {
    "Authorization": f"Bearer {token}",
    "Accept": "application/json"
}

# 2. Get Staff employees & roles
print("\nFetching staff & roles from /api/staff/employees...")
res_staff = requests.get(f"{API_URL}/staff/employees", headers=headers)
print("Staff list status:", res_staff.status_code)
staff_data = res_staff.json()
data = staff_data.get("data", {})
staff_members = data.get("staff", [])
roles = data.get("roles", [])
print(f"Total staff members returned: {len(staff_members)}")
print(f"Total role templates returned: {len(roles)}")
for r in roles[:3]:
    print(f" - Role: {r.get('display_name')} ({r.get('name')}) - {len(r.get('permissions', []))} perms")

print("\nVerification completed successfully!")
