import pytest
from fastapi.testclient import TestClient
from main import app
import uuid
import json
import os

client = TestClient(app)

def test_disabled_login_enforcement():
    # 1. Register a user
    email = f"victim_{uuid.uuid4()}@example.com"
    password = "password123"
    
    client.post("/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Victim User"
    })
    
    # 2. Verify Login works initially
    res_login_1 = client.post("/auth/token", data={
        "username": email,
        "password": password
    })
    assert res_login_1.status_code == 200

    # 3. Disable the user
    # We simulate admin action by modifying the JSON file directly to ensure tests rely on finding the user state.
    # Alternatively, if we had a stable Admin user in tests, we could use the API.
    # Modifying the file is "cheating" but effective for this specific "verification script logic" port.
    # Ideally, we should use a dependency override or a separate admin creation for tests.
    # BUT, since we are using file-based persistence, we can just modify the file.
    
    users_file = "data/users.json"
    if os.path.exists(users_file):
        with open(users_file, 'r') as f:
            users = json.load(f)
        
        found = False
        for user in users:
            if user["email"] == email:
                user["disabled"] = True
                found = True
                break
        
        if found:
            with open(users_file, 'w') as f:
                json.dump(users, f, indent=4)
    
    # 4. Verify Login fails
    res_login_2 = client.post("/auth/token", data={
        "username": email,
        "password": password
    })
    
    # Expecting 403 Forbidden with "User account is disabled" or 400
    # The main.py code says: raise HTTPException(status_code=403, detail="User account is disabled")
    assert res_login_2.status_code == 403
    assert "disabled" in res_login_2.json()["detail"].lower()
