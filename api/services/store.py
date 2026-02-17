"""
MongoDB-based storage for study plans
Replaces JSON file storage with MongoDB Atlas
"""

from typing import List, Optional
from models import StudyPlan
from services.mongodb_service import MongoDBService
from datetime import datetime


class MongoDBStore:
    """Store for study plans using MongoDB"""
    
    def __init__(self):
        self.mongo = MongoDBService()
        self.collection = self.mongo.db.study_plans
    
    def save_plan(self, plan: StudyPlan, user_id: str = "default-user"):
        """Save or update a study plan for a specific user"""
        # Convert plan to dict
        plan_data = plan.model_dump(mode='json')
        
        # Add user_id and metadata
        plan_data['user_id'] = user_id
        plan_data['plan_id'] = plan.id
        plan_data['updated_at'] = datetime.utcnow()
        
        # Upsert: update if exists, insert if new
        self.collection.update_one(
            {"user_id": user_id, "plan_id": plan.id},
            {"$set": plan_data},
            upsert=True
        )
    
    def get_all_plans(self, user_id: str = "default-user") -> List[StudyPlan]:
        """Get all plans for a specific user"""
        try:
            cursor = self.collection.find({"user_id": user_id})
            plans = []
            for doc in cursor:
                # Remove MongoDB _id field
                doc.pop('_id', None)
                doc.pop('user_id', None)
                doc.pop('plan_id', None)
                doc.pop('updated_at', None)
                plans.append(StudyPlan(**doc))
            return plans
        except Exception as e:
            print(f"Error fetching plans: {e}")
            return []
    
    def get_plan(self, plan_id: str, user_id: str = "default-user") -> Optional[StudyPlan]:
        """Get a specific plan for a user"""
        try:
            doc = self.collection.find_one({
                "user_id": user_id,
                "plan_id": plan_id
            })
            
            if doc:
                # Remove MongoDB metadata
                doc.pop('_id', None)
                doc.pop('user_id', None)
                doc.pop('plan_id', None)
                doc.pop('updated_at', None)
                return StudyPlan(**doc)
            return None
        except Exception as e:
            print(f"Error fetching plan {plan_id}: {e}")
            return None
    
    def delete_plan(self, plan_id: str, user_id: str = "default-user"):
        """Delete a plan for a specific user"""
        result = self.collection.delete_one({
            "user_id": user_id,
            "plan_id": plan_id
        })
        return result.deleted_count > 0
    
    def update_topic_status(self, plan_id: str, topic_id: str, new_status: str, user_id: str = "default-user"):
        """Update the status of a specific topic within a plan"""
        # Get the plan
        plan = self.get_plan(plan_id, user_id)
        if not plan:
            return False
        
        # Update topic status
        changed = False
        for day in plan.schedule:
            for topic in day.topics:
                if topic.id == topic_id:
                    topic.status = new_status
                    changed = True
                    break
            if changed:
                break
        
        # Save updated plan
        if changed:
            self.save_plan(plan, user_id)
            return True
        return False
    
    def update_plan(self, plan_id: str, updates: dict, user_id: str = "default-user"):
        """Update specific fields of a plan"""
        # Get existing plan
        plan = self.get_plan(plan_id, user_id)
        if not plan:
            return False
        
        # Apply updates
        plan_data = plan.model_dump()
        plan_data.update(updates)
        
        # Re-validate with Pydantic
        updated_plan = StudyPlan(**plan_data)
        
        # Save updated plan
        self.save_plan(updated_plan, user_id)
        return True


# Backward compatibility alias
JSONStore = MongoDBStore
