
import json
import os
from typing import List, Optional
from models import StudyPlan

DATA_DIR = "data"
PLANS_FILE = os.path.join(DATA_DIR, "plans.json")

class JSONStore:
    def __init__(self):
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR)
        if not os.path.exists(PLANS_FILE):
            with open(PLANS_FILE, "w") as f:
                json.dump([], f)

    def save_plan(self, plan: StudyPlan):
        plans = self.get_all_plans()
        # Remove existing if same ID (update)
        plans = [p for p in plans if p.id != plan.id]
        plans.append(plan)
        
        with open(PLANS_FILE, "w") as f:
            # Pydantic v2 dump (or .dict() for v1)
            # Assuming recent Pydantic from requirements
            json.dump([p.model_dump(mode='json') for p in plans], f, indent=2)

    def get_all_plans(self) -> List[StudyPlan]:
        if not os.path.exists(PLANS_FILE):
            return []
        try:
            with open(PLANS_FILE, "r") as f:
                data = json.load(f)
                return [StudyPlan(**item) for item in data]
        except (json.JSONDecodeError, FileNotFoundError):
            return []

    def get_plan(self, plan_id: str) -> Optional[StudyPlan]:
        plans = self.get_all_plans()
        for p in plans:
            if p.id == plan_id:
                return p
        return None
