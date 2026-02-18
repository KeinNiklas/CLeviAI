import pytest
from fastapi.testclient import TestClient
from main import app
import uuid
import os
import json

client = TestClient(app)

@pytest.fixture
def unique_email():
    return f"user_{uuid.uuid4()}@example.com"

@pytest.fixture
def auth_headers(unique_email):
    # Register and login a user
    password = "password123"
    client.post("/auth/register", json={
        "email": unique_email,
        "password": password,
        "full_name": "Test User"
    })
    response = client.post("/auth/token", data={
        "username": unique_email,
        "password": password
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_plan_ownership():
    # 1. Setup two users
    email_a = f"userA_{uuid.uuid4()}@example.com"
    pass_a = "passwordA"
    client.post("/auth/register", json={"email": email_a, "password": pass_a, "full_name": "User A"})
    token_a = client.post("/auth/token", data={"username": email_a, "password": pass_a}).json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    email_b = f"userB_{uuid.uuid4()}@example.com"
    pass_b = "passwordB"
    client.post("/auth/register", json={"email": email_b, "password": pass_b, "full_name": "User B"})
    token_b = client.post("/auth/token", data={"username": email_b, "password": pass_b}).json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 2. User A creates a plan
    from datetime import date, timedelta
    future_date = (date.today() + timedelta(days=90)).isoformat()
    plan_data = {
        "topics": [{"id": "t1", "title": "T1", "description": "D1", "estimated_hours": 1, "material_id": "mat1", "status": "pending"}],
        "exam_date": future_date,
        "parallel_courses": 1,
        "title": "User A Plan",
        "daily_goal": 2.0,
        "study_days": [0,1,2]
    }
    res_create = client.post("/create-plan", json=plan_data, headers=headers_a)
    assert res_create.status_code == 200
    plan_id = res_create.json()["id"]

    # 3. User A should see the plan
    res_get_a = client.get("/plans", headers=headers_a)
    plans_a = res_get_a.json()
    assert any(p["id"] == plan_id for p in plans_a)

    # 4. User B should NOT see the plan
    res_get_b = client.get("/plans", headers=headers_b)
    plans_b = res_get_b.json()
    assert not any(p["id"] == plan_id for p in plans_b)

    # 5. User B tries to GET specific plan -> 403
    res_detail_b = client.get(f"/plans/{plan_id}", headers=headers_b)
    assert res_detail_b.status_code == 403

    # 6. User B tries to DELETE plan -> 403
    res_del_b = client.delete(f"/plans/{plan_id}", headers=headers_b)
    assert res_del_b.status_code == 403

    # 7. User A deletes plan -> 200
    res_del_a = client.delete(f"/plans/{plan_id}", headers=headers_a)
    assert res_del_a.status_code == 200

    # Clean up (User A is deleted, plans cascade? Logic might not be there yet but test ends here)
    # Ideally use a teardown fixture or rely on test DB isolation if we had one.
    # For file-based JSON, we might pollute it, but uuid emails avoid collision.
