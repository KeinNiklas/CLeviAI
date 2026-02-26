import os
import certifi
from typing import List, Optional
from pymongo import MongoClient

try:
    from models import StudyPlan, User
except ImportError:
    from ..models import StudyPlan, User

class MongoStore:
    def __init__(self):
        self.uri = os.getenv("MONGODB_TEST_URI")
        
        if not self.uri:
            # Try MONGODB_URI fallback
            self.uri = os.getenv("MONGODB_URI")
        
        # Fallback: Read from mongodb.env if not set
        if not self.uri:
            env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "mongodb.env")
            if os.path.exists(env_path):
                try:
                    with open(env_path, "r") as f:
                        content = f.read().strip()
                        if "=" in content:
                            # Handle KEY=VALUE format
                            key, value = content.split("=", 1)
                            if "MONGODB" in key:
                                self.uri = value.strip()
                        else:
                            # Handle raw URI
                            self.uri = content
                except Exception as e:
                    print(f"Error reading mongodb.env: {e}")

            
        if not self.uri:
            raise ValueError("MONGODB_TEST_URI or MONGODB_URI environment variable is not set")
        
        # Use certifi for SSL certificates to avoid connection errors on some platforms
        self.client = MongoClient(self.uri, tlsCAFile=certifi.where())

        # Database selection
        self.db = self.client["cleviaidb"]
        self.plans_collection = self.db.study_plans
        self.users_collection = self.db.users

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

    # --- User Management ---
    def get_user(self, user_id: str) -> Optional[User]:
        doc = self.users_collection.find_one({'id': user_id}, {'_id': 0})
        if doc:
            return User(**doc)
        return None
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        doc = self.users_collection.find_one({'email': email}, {'_id': 0})
        if doc:
            return User(**doc)
        return None

    def save_user(self, user: User):
        user_dict = user.model_dump(mode='json')
        self.users_collection.update_one(
            {'id': user.id},
            {'$set': user_dict},
        upsert=True
        )

    def get_all_users(self) -> List[User]:
        cursor = self.users_collection.find({}, {'_id': 0})
        users = []
        for doc in cursor:
            users.append(User(**doc))
        return users

    def update_user(self, user_id: str, updates: dict) -> bool:
        if not updates:
            return False

        result = self.users_collection.update_one(
            {'id': user_id},
            {'$set': updates}
        )
        return result.matched_count > 0

    def delete_user(self, user_id: str) -> bool:
        result = self.users_collection.delete_one({'id': user_id})
        return result.deleted_count > 0

    def delete_plans_by_user(self, user_id: str):
        self.plans_collection.delete_many({'user_id': user_id})
