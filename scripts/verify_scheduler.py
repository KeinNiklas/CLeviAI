import requests
import json
from datetime import date, timedelta

# Mock Topic Data based on current model
topic = {
    "id": "topic_1",
    "title": "Test Topic",
    "description": "A test topic",
    "estimated_hours": 2.0,
    "material_id": "file.pdf",
    "flashcards": [],
    "games": [],
    "status": "OPEN"
}

payload = {
    "topics": [topic, topic],
    "exam_date": (date.today() + timedelta(days=5)).isoformat(),
    "parallel_courses": 0,
    "title": "Test Plan",
    "daily_goal": 2.0,
    "study_days": [0, 1, 2, 3, 4] # Mon-Fri
}

print("Sending payload:", json.dumps(payload, indent=2))

try:
    response = requests.post("http://localhost:8000/create-plan", json=payload)
    print(f"Status Code: {response.status_code}")
    if response.ok:
        print("Success!")
        print(json.dumps(response.json(), indent=2))
    else:
        print("Error response:", response.text)
except Exception as e:
    print("Request failed:", e)
