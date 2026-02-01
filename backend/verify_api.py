
import requests
import json
import os
import time

BASE_URL = "http://localhost:8006"

def verify_api():
    print("Waiting for backend to start...")
    time.sleep(5) # Wait for server start
    
    # 1. Health Check
    try:
        r = requests.get(f"{BASE_URL}/health")
        print(f"Health Check: {r.status_code} {r.json()}")
    except Exception as e:
        print(f"Backend not reachable: {e}")
        return

    # 2. Analyze Document
    print("\nTesting /analyze-document...")
    file_path = "../test_doc.txt"
    if not os.path.exists(file_path):
        print("Test file not found!")
        return

    with open(file_path, "rb") as f:
        files = {"file": ("test_doc.txt", f, "text/plain")}
        r = requests.post(f"{BASE_URL}/analyze-document", files=files)
    
    if r.status_code != 200:
        print(f"Analysis Failed: {r.status_code} {r.text}")
        return
    
    topics = r.json()
    print(f"Topics Found: {len(topics)}")
    print(json.dumps(topics, indent=2))

    if not topics:
        print("No topics found, cannot proceed to plan creation.")
        return

    # 3. Create Plan
    print("\nTesting /create-plan...")
    payload = {
        "topics": topics,
        "exam_date": "2026-03-01",
        "parallel_courses": 1
    }
    
    r = requests.post(f"{BASE_URL}/create-plan", json=payload)
    
    if r.status_code != 200:
        print(f"Plan Creation Failed: {r.status_code} {r.text}")
        return

    plan = r.json()
    print("Plan Created Successfully!")
    print(f"Plan ID: {plan.get('id')}")
    print(f"Total Days: {len(plan.get('schedule', []))}")
    print(json.dumps(plan, indent=2))

if __name__ == "__main__":
    verify_api()
