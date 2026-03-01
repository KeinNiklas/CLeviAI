import sys
import os

# Add current directory to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
import json

client = TestClient(app)

def print_status(message, success):
    icon = "✅" if success else "❌"
    print(f"{icon} {message}")

def test_auth_routes():
    print("🚀 Starting Automated Auth Tests...")
    
    # 1. Create Dummy User
    dummy_user = {
        "email": "dummy_test_user@example.com",
        "password": "securepassword123",
        "full_name": "Dummy Test User"
    }
    
    print(f"\n👤 Setting up Dummy User: {dummy_user['email']}")
    
    # Try to register (ignore if exists)
    response = client.post("/auth/register", json=dummy_user)
    if response.status_code == 200:
        print_status("User registered successfully", True)
    elif response.status_code == 400 and "already registered" in response.json().get("detail", ""):
        print_status("User already exists (skipping registration)", True)
    else:
        print_status(f"Failed to register user: {response.text}", False)
        return

    # 2. Login to get Token
    print("\n🔑 Logging in...")
    login_data = {
        "username": dummy_user["email"],
        "password": dummy_user["password"]
    }
    response = client.post("/auth/token", data=login_data)
    
    if response.status_code != 200:
        print_status(f"Login failed: {response.text}", False)
        return
    
    token = response.json().get("access_token")
    if not token:
        print_status("No token received", False)
        return
        
    print_status("Token received successfully", True)
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Define Routes to Test
    # Tuple format: (method, url, data/json, expected_status_with_token)
    # expected_status_with_token matches typical validation errors or success
    # We primarily check that it is NOT 401 when authenticated
    routes = [
        ("GET", "/plans", None, 200),
        ("POST", "/create-plan", {"topics": [], "exam_date": "2024-12-31", "parallel_courses": 1}, 422), # 422 because topics empty/validation, but proves auth passed
        ("POST", "/create-plan", {"topics": [], "exam_date": "2024-12-31", "parallel_courses": 1}, 422), # 422 because topics empty/validation, but proves auth passed
        ("GET", "/settings/config", None, 403), # Admin only now
        # analyze-document is multipart, slightly complex to test here easily without file, 
        # but we can try empty and expect 422, ensuring 401 is passed
        ("POST", "/analyze-document", {}, 422), 
        ("POST", "/podcast/generate", {"topic_title": "test", "topic_description": "test"}, 200),
        ("GET", "/users/me", None, 200)
    ]

    print("\n🛡️ Testing Protected Routes:")
    
    all_passed = True
    
    for method, url, data, expected_code in routes:
        print(f"\nTesting {method} {url}...")
        
        # Test WITHOUT Token (Logged Out)
        if method == "GET":
            resp_out = client.get(url)
        else:
            resp_out = client.post(url, json=data) if data else client.post(url)
            
        if resp_out.status_code == 401:
            print_status("Logged Out: Access Denied (Expected 401)", True)
        else:
            print_status(f"Logged Out: Failed! Got {resp_out.status_code}, expected 401", False)
            all_passed = False

        # Test WITH Token (Logged In)
        if method == "GET":
            resp_in = client.get(url, headers=headers)
        else:
            resp_in = client.post(url, json=data, headers=headers) if data else client.post(url, headers=headers)
            
        # We accept 200-299 or 400/422 (validation error) or specific expected code as "Auth Passed"
        # We fail if it is 401 or (403 if not expected)
        
        if resp_in.status_code == expected_code or (resp_in.status_code not in [401, 403] and expected_code not in [401, 403]):
             print_status(f"Logged In: Access Granted (Got {resp_in.status_code})", True)
        else:
             print_status(f"Logged In: Failed! Got {resp_in.status_code}, expected {expected_code}", False)
             all_passed = False

    print("\n" + "="*30)
    if all_passed:
        print("✅ ALL AUTH TESTS PASSED")
    else:
        print("❌ SOME AUTH TESTS FAILED")

def teardown(email):
    print(f"\n--- Teardown: Removing user {email} ---")
    # This script uses TestClient which might use a different DB path or the same one?
    # Usually TestClient uses the app as passed, so it uses the same environment.
    # However, logic in main.py uses "data/users.json" relative path.
    # If run from backend dir, it should be fine.
    
    users_file = "data/users.json"
    import json
    import os
    try:
        if not os.path.exists(users_file):
            return
        
        with open(users_file, 'r') as f:
            users = json.load(f)
        
        original_count = len(users)
        users = [u for u in users if u["email"] != email]
        
        if len(users) < original_count:
            with open(users_file, 'w') as f:
                json.dump(users, f, indent=4)
            print("   User removed from DB.")
        else:
            print("   User not found in DB during teardown.")
    except Exception as e:
        print(f"   Teardown failed: {e}")

if __name__ == "__main__":
    email = "dummy_test_user@example.com"
    try:
        test_auth_routes()
    finally:
        teardown(email)
