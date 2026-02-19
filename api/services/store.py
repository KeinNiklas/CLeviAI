
import json
import os
from typing import List, Optional
try:
    from models import StudyPlan
except ImportError:
    from ..models import StudyPlan

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

    def delete_plan(self, plan_id: str):
        plans = self.get_all_plans()
        updated_plans = [p for p in plans if p.id != plan_id]
        if len(plans) != len(updated_plans):
            with open(PLANS_FILE, "w") as f:
                json.dump([p.model_dump(mode='json') for p in updated_plans], f, indent=2)

    def update_topic_status(self, plan_id: str, topic_id: str, new_status: str):
        plans = self.get_all_plans()
        changed = False
        
        for plan in plans:
            if plan.id == plan_id:
                for day in plan.schedule:
                    for topic in day.topics:
                        if topic.id == topic_id:
                            topic.status = new_status
                            changed = True
                            break
                    if changed: break
            if changed: break
        
        if changed:
            with open(PLANS_FILE, "w") as f:
                json.dump([p.model_dump(mode='json') for p in plans], f, indent=2)
    def update_plan(self, plan_id: str, updates: dict):
        plans = self.get_all_plans()
        changed = False
        
        for plan in plans:
            if plan.id == plan_id:
                # Apply updates
                updated_data = plan.model_dump()
                updated_data.update(updates)
                # Re-validate with Pydantic
                new_plan = StudyPlan(**updated_data)
                
                # Replace logic: finding index and swapping
                idx = plans.index(plan)
                plans[idx] = new_plan
                changed = True
                break
        
        if changed:
            with open(PLANS_FILE, "w") as f:
                json.dump([p.model_dump(mode='json') for p in plans], f, indent=2)
            return True
        return False
        
    def delete_plans_by_user(self, user_id: str):
        plans = self.get_all_plans()
        remaining_plans = [p for p in plans if p.user_id != user_id]
        
        if len(plans) != len(remaining_plans):
            with open(PLANS_FILE, "w") as f:
                json.dump([p.model_dump(mode='json') for p in remaining_plans], f, indent=2)
            return True
        return False
