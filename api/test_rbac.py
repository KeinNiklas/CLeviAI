import pytest
from fastapi.testclient import TestClient
from main import app
import uuid

client = TestClient(app)

def test_rbac_default_role():
    # 1. Register a new user
    email = f"rbac_test_{uuid.uuid4()}@example.com"
    password = "password123"
    name = "RBAC Tester"
    
    res_reg = client.post("/auth/register", json={
        "email": email,
        "password": password,
        "full_name": name
    })
    
    assert res_reg.status_code == 200
    user_data = res_reg.json()
    
    # Check if role is present and default is 'user'
    assert "role" in user_data
    assert user_data["role"] == "user"

    # 2. Login to get token
    res_token = client.post("/auth/token", data={
        "username": email,
        "password": password
    })
    assert res_token.status_code == 200
    token = res_token.json()["access_token"]
    
    # 3. Fetch /users/me
    res_me = client.get("/users/me", headers={
        "Authorization": f"Bearer {token}"
    })
    
    assert res_me.status_code == 200
    me_data = res_me.json()
    
    assert "role" in me_data
    assert me_data["role"] == "user"
