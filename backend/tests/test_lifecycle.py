
import os
import pytest
from fastapi.testclient import TestClient
from main import app
from datetime import date

client = TestClient(app)

# Path to the test file requested by the user
TEST_PDF_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend/__tests__/ITSK001_Einführung.pdf")

@pytest.mark.integration
def test_study_plan_lifecycle():
    """
    Integration test for the full study plan lifecycle with MOCKED Analysis.
    This avoids Rate Limit issues (429/413) with Gemini/Groq during testing.
    """
    from unittest.mock import patch
    from models import Topic

    # 0. Prerequisite Check
    if not os.path.exists(TEST_PDF_PATH):
        pytest.skip(f"Test file not found at {TEST_PDF_PATH}")

    print(f"\n[Lifecycle] Starting test with file: {TEST_PDF_PATH}")

    # Mock Data to return from AnalyzerService
    mock_topics = [
        {"title": "Introduction to AI", "description": "Basics of AI", "estimated_hours": 2.0},
        {"title": "Neural Networks", "description": "Deep Learning basics", "estimated_hours": 3.0}
    ]

    # We patch the method on the CLASS, so the instance in main.py uses it
    with patch("services.analyzer.AnalyzerService.analyze_text") as mock_analyze:
        # Configure the mock to return list of Topic objects (or dicts if pydantic handles it, 
        # but the service returns Topic objects usually. Let's return objects or dicts matching expectations)
        # The endpoint calls .analyze_text and expects a list of Topic.
        # Let's ensure we return what the service returns.
        
        # We need to construct actual Topic objects if the code expects them.
        # Looking at main.py: topics = analyzer_service.analyze_text(...) -> returns List[Topic]
        # models.Topic is likely a Pydantic model.
        
        mock_analyze.return_value = [
            Topic(
                id="topic_1", 
                title="Introduction to AI", 
                description="Basics of AI", 
                estimated_hours=2.0, 
                material_id="mock_pdf",
                flashcards=[],
                games=[]
            ),
             Topic(
                id="topic_2", 
                title="Neural Networks", 
                description="Deep Learning basics", 
                estimated_hours=3.0, 
                material_id="mock_pdf",
                flashcards=[],
                games=[]
            )
        ]

        # 1. Analyze Document
        with open(TEST_PDF_PATH, "rb") as f:
            files = {"files": (os.path.basename(TEST_PDF_PATH), f, "application/pdf")}
            response = client.post("/analyze-document", files=files, data={"language": "de"})
        
        assert response.status_code == 200, f"Analysis failed: {response.text}"
        topics = response.json()
        assert len(topics) == 2, "Mocked topics not returned"
        print(f"[Lifecycle] Extracted {len(topics)} topics (Mocked).")

    # 2. Create Study Plan
    from datetime import timedelta
    plan_payload = {
        "topics": topics,
        "exam_date": str(date.today() + timedelta(days=30)), # Must be in future 
        "parallel_courses": 1,
        "title": "Integration Test Plan",
        "daily_goal": 1.5,
        "study_days": [0, 1, 2, 3, 4] 
    }

    create_response = client.post("/create-plan", json=plan_payload)
    assert create_response.status_code == 200, f"Plan creation failed: {create_response.text}"
    created_plan = create_response.json()
    
    plan_id = created_plan.get("id")
    assert plan_id is not None, "Plan ID is missing"
    assert created_plan["title"] == "Integration Test Plan"
    print(f"[Lifecycle] Created plan with ID: {plan_id}")

    # 3. Retrieve Plan (simulate UI opening the plan)
    get_response = client.get(f"/plans/{plan_id}")
    assert get_response.status_code == 200, f"Failed to retrieve plan: {get_response.text}"
    retrieved_plan = get_response.json()
    
    # Validation in memory (via API)
    assert retrieved_plan["id"] == plan_id
    assert retrieved_plan["title"] == "Integration Test Plan"
    assert len(retrieved_plan["schedule"]) > 0, "Plan schedule is empty"
    print("[Lifecycle] Plan retrieved and validated successfully.")

    # 4. Delete Plan
    delete_response = client.delete(f"/plans/{plan_id}")
    assert delete_response.status_code == 200, "Failed to delete plan"
    
    # Verify Deletion (should return 404 now)
    verify_delete_response = client.get(f"/plans/{plan_id}")
    assert verify_delete_response.status_code == 404, "Plan still exists after deletion"
    print("[Lifecycle] Plan deleted and verified missing.")

