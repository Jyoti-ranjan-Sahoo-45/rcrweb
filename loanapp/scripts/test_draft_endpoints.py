import requests
import json
import time

BASE_URL = 'https://rcrfinance.com/api'

# Test credentials
test_ts = int(time.time())
test_phone = f"9876{test_ts % 1000000:06d}"

session = requests.Session()
session.headers.update({'Accept': 'application/json', 'Content-Type': 'application/json'})

print('1. Registering clean customer for end-to-end draft flow test...')
reg_data = {
    'name': 'Draft Tester',
    'email': f'tester_{test_ts}@example.com',
    'phone': test_phone,
    'password': 'TestPassword@123'
}

reg_res = session.post(f'{BASE_URL}/auth/register', json=reg_data)
print(f'Register status: {reg_res.status_code}')
if reg_res.status_code not in (200, 201):
    print(f'Register response: {reg_res.text}')
    exit(1)

token = reg_res.json().get('token')

if not token:
    print('Could not obtain token!')
    exit(1)

session.headers.update({'Authorization': f'Bearer {token}'})
print('Logged in successfully! Token acquired.')

# 2. Check active draft before creating one
print('\n2. Testing GET /api/applications/active-draft...')
draft_res = session.get(f'{BASE_URL}/applications/active-draft')
print(f'Initial active-draft response: {draft_res.status_code} {draft_res.json()}')

# 3. Simulate saving draft at Step 3
print('\n3. Saving application draft at Step 3...')
draft_payload = {
    'product_id': 1,
    'requested_amount': 75000,
    'requested_tenure_months': 12,
    'purpose': 'Medical Expenses',
    'current_step': 3,
    'personal': {
        'full_name': 'Draft Test Applicant',
        'first_name': 'Draft',
        'last_name': 'Applicant',
        'father_husband_name': 'Test Father',
        'dob': '1990-01-01',
        'gender': 'Male',
        'marital_status': 'Married',
        'phone': '9999012345',
        'email': 'applicant@rcrtest.com',
        'pan_number': 'ABCDE1234F',
        'aadhaar_number': '123456789012',
        'current_address_line1': '123 Test Street',
        'current_city': 'Bhubaneswar',
        'current_state': 'Odisha',
        'current_pincode': '751001',
        'residence_type': 'Rented',
        'years_at_current_address': '2',
        'reference_name': 'Friend Test',
        'reference_phone': '9876543211',
        'reference_relationship': 'Friend',
        'declaration_accepted': False
    },
    'employment': {
        'employment_type': 'Salaried',
        'employer_name': 'Tech Corp',
        'designation': 'Executive',
        'office_address': 'Infocity',
        'monthly_income': 60000,
        'work_experience_years': 4
    },
    'financial': {
        'monthly_expenses': 20000,
        'existing_emi_obligations': 5000,
        'primary_bank_name': 'HDFC Bank',
        'account_holder_name': 'Draft Test Applicant',
        'account_number': '1234567890',
        'ifsc_code': 'HDFC0001234',
        'account_type': 'savings'
    }
}

save_res = session.post(f'{BASE_URL}/applications/draft', json=draft_payload)
print(f'Save draft status: {save_res.status_code}')
draft_data = save_res.json()
print(f'Save draft response: {json.dumps(draft_data, indent=2)}')
app_id = draft_data.get('data', {}).get('id')

# 4. Verify GET /api/applications/active-draft
print(f'\n4. Checking active draft for app_id {app_id}...')
verify_draft = session.get(f'{BASE_URL}/applications/active-draft')
print(f'Verify active draft: {json.dumps(verify_draft.json(), indent=2)}')
assert verify_draft.json().get('has_draft') == True, 'Expected has_draft to be True'
assert verify_draft.json().get('data', {}).get('current_step') == 3, 'Expected current_step to be 3'

# 5. Check Customer Dashboard
print('\n5. Checking customer dashboard response...')
dash_res = session.get(f'{BASE_URL}/customer/dashboard')
dash_data = dash_res.json()
print(f'Dashboard next_action: {json.dumps(dash_data.get("next_action"), indent=2)}')
assert dash_data.get('next_action', {}).get('is_draft') == True, 'Expected next_action.is_draft to be True'
assert dash_data.get('next_action', {}).get('current_step') == 3, 'Expected current_step to be 3'
assert f'step=3' in dash_data.get('next_action', {}).get('action_url'), 'Expected action_url to have step=3'

# 6. Test Discard Draft (DELETE /api/applications/draft/{id})
print(f'\n6. Discarding draft {app_id}...')
discard_res = session.delete(f'{BASE_URL}/applications/draft/{app_id}')
print(f'Discard response: {discard_res.status_code} {discard_res.json()}')
assert discard_res.status_code == 200

# 7. Confirm draft is gone
print('\n7. Confirming draft is gone after discard...')
verify_after_discard = session.get(f'{BASE_URL}/applications/active-draft')
print(f'Verify after discard: {verify_after_discard.json()}')
assert verify_after_discard.json().get('has_draft') == False

print('\nALL VERIFICATION TESTS PASSED SUCCESSFULLY! [SUCCESS]')
