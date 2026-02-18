import os
import certifi
from typing import List, Optional
from pymongo import MongoClient
from ..models import StudyPlan

class MongoStore:
    def __init__(self):
        self.uri = "mongodb+srv://test_vercel:egILnrV16GLGGMZr@clavidb.qkkcbfh.mongodb.net/?appName=clavidb" #os.getenv("MONGODB_URI")
        if not self.uri:
            raise ValueError("MONGODB_URI environment variable is not set")
        
        # Use certifi for SSL certificates to avoid connection errors on some platforms
        self.client = MongoClient(self.uri, tlsCAFile=certifi.where())

        # Hard Coded - muss mal ersetzt werden
        self.db = self.client["study_plans"]
        self.plans_collection = self.db.study_plans

    def save_plan(self, plan: StudyPlan):
        # Convert to dict using Pydantic's mode='json' to handle dates etc.
        plan_dict = plan.model_dump(mode='json')
        
        # We query by 'id' (the string ID) and upsert.
        # We do NOT set '_id' manually anymore, letting Mongo handle it (or keeping existing if update).
        
        self.plans_collection.update_one(
            {'id': plan.id},
            {'$set': plan_dict},
            upsert=True
        )

    def get_all_plans(self) -> List[StudyPlan]:
        # Exclude _id from result to keep Pydantic happy
        cursor = self.plans_collection.find({}, {'_id': 0})
        plans = []
        for doc in cursor:
            plans.append(StudyPlan(**doc))
        return plans

    def get_plan(self, plan_id: str) -> Optional[StudyPlan]:
        # Query by 'id', exclude '_id'
        doc = self.plans_collection.find_one({'id': plan_id}, {'_id': 0})
        if doc:
            return StudyPlan(**doc)
        return None

    def delete_plan(self, plan_id: str):
        self.plans_collection.delete_one({'id': plan_id})

    def update_plan(self, plan_id: str, updates: dict) -> bool:
        if not updates:
            return False

        result = self.plans_collection.update_one(
            {'id': plan_id},
            {'$set': updates}
        )
        return result.matched_count > 0

    def update_topic_status(self, plan_id: str, topic_id: str, new_status: str):
        # Efficient update using array filters
        # schedule -> days -> topics
        # We need to match the plan by 'id'
        # And find the nested topic.
        
        # Since the structure is nested (schedule list -> topics list), 
        # standard array filters are hard if we don't know the day index.
        # Fallback to fetch-modify-save pattern is safer and cleaner given the complexity.
        
        plan = self.get_plan(plan_id)
        if not plan:
            return

        changed = False
        for day in plan.schedule:
            for topic in day.topics:
                if topic.id == topic_id:
                    topic.status = new_status
                    changed = True
                    break
            if changed: break
        
        if changed:
            self.save_plan(plan)
