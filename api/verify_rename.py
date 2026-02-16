import requests
import json
from datetime import date

# 1. Create a dummy plan first
setup_payload = {
    "topics": [{"id": "t1", "title": "T1", "description": "desc", "material_id": "m1", "estimated_hours": 1, "games": []}],
    "exam_date": "2026-12-31",
    "parallel_courses": 0,
    "title": "Original Title"
}

try:
    # Create
    r = requests.post("http://localhost:8000/create-plan", json=setup_payload)
    if not r.ok:
        print("Setup failed:", r.text)
        exit(1)
    
    plan_id = r.json()["id"]
    print(f"Created plan: {plan_id}")

    # 2. Rename
    print("Renaming plan...")
    rename_payload = {"title": "New Title 123"}
    r = requests.patch(f"http://localhost:8000/plans/{plan_id}", json=rename_payload)
    
    if r.ok:
        print("Rename Success!")
    else:
        print("Rename Failed:", r.text)
        exit(1)

    # 3. Verify
    print("Verifying persistence...")
    r = requests.get("http://localhost:8000/plans")
    plans = r.json()
    my_plan = next((p for p in plans if p["id"] == plan_id), None)
    
    if my_plan and my_plan["title"] == "New Title 123":
        print("Verification Passed: Title is 'New Title 123'")
    else:
        print("Verification Failed:", my_plan)

except Exception as e:
    print("Error:", e)
