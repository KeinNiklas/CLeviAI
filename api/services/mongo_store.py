import os
import certifi
from typing import List, Optional
from pymongo import MongoClient
from ..models import StudyPlan

class MongoStore:
    def __init__(self):
        self.uri = os.getenv("MONGODB_URI")
        if not self.uri:
            raise ValueError("MONGODB_URI environment variable is not set")
        
        # Use certifi for SSL certificates to avoid connection errors on some platforms
        self.client = MongoClient(self.uri, tlsCAFile=certifi.where())
        self.db = self.client.get_default_database()
        self.plans_collection = self.db.study_plans

    def save_plan(self, plan: StudyPlan):
        # Convert to dict using Pydantic's mode='json' to handle dates etc.
        plan_dict = plan.model_dump(mode='json')
        # Use _id as the primary key in Mongo
        plan_dict['_id'] = plan.id
        
        self.plans_collection.replace_one(
            {'_id': plan.id},
            plan_dict,
            upsert=True
        )

    def get_all_plans(self) -> List[StudyPlan]:
        cursor = self.plans_collection.find()
        plans = []
        for doc in cursor:
            # Pydantic expects 'id', not '_id' (though we can map it if we want, 
            # but simpler to just let it ignore _id or copy it back if strictly needed.
            # StudyPlan has an 'id' field.
            # We stored 'id' inside the dict as well because model_dump includes it.
            # So we can just pass the doc.
            
            # Remove _id to avoid pydantic error if it's strict, 
            # or just ensure StudyPlan ignores extra fields (default is ignore)
            if '_id' in doc:
                del doc['_id']
            plans.append(StudyPlan(**doc))
        return plans

    def get_plan(self, plan_id: str) -> Optional[StudyPlan]:
        doc = self.plans_collection.find_one({'_id': plan_id})
        if doc:
            if '_id' in doc:
                del doc['_id']
            return StudyPlan(**doc)
        return None

    def delete_plan(self, plan_id: str):
        self.plans_collection.delete_one({'_id': plan_id})

    def update_plan(self, plan_id: str, updates: dict) -> bool:
        # We need to be careful with nested updates (like topics inside schedule)
        # But here 'updates' comes from the API which is usually top-level fields for PlanUpdate.
        # If it's partial update logic from store.py, let's see...
        # The JSONStore implementation fetches, updates object, saves.
        # For Mongo, we can just $set the fields.
        
        if not updates:
            return False

        result = self.plans_collection.update_one(
            {'_id': plan_id},
            {'$set': updates}
        )
        return result.matched_count > 0

    def update_topic_status(self, plan_id: str, topic_id: str, new_status: str):
        # This is tricky because topics are nested in schedule -> days -> topics
        # We need to find the plan, modify the specific topic, and save.
        # Doing this via array filters in Mongo is efficient but complex to construct dynamically
        # given the nested structure (schedule is list of days, day has list of topics).
        # Easier to fetch, modify, save for consistency with JSONStore logic 
        # unless performance is critical.
        
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
