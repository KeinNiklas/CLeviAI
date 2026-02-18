
import os
import sys
import datetime
from bson import ObjectId

# Add api to path
sys.path.append(os.path.join(os.getcwd(), "api"))

# Loading env
from dotenv import load_dotenv
if os.path.exists("api/mongodb.env"):
    with open("api/mongodb.env", "r") as f:
        content = f.read().strip()
    if content.startswith("mongodb"):
         os.environ["MONGODB_URI"] = content
    else:
         load_dotenv("api/mongodb.env")

try:
    from api.services.mongo_store import MongoStore
    from api.models import StudyPlan

    store = MongoStore()
    print(f"✅ MongoStore initialized.")

    # 1. Insert a raw document simulating the user's example
    # Note: We need to make sure the structure matches StudyPlan model requirements
    # The user example has "status": "MASTERED" in topics which is fine.
    # It has "games" which is in the model.
    
    plan_id = "test_plan_schema_verify"
    raw_doc = {
        "_id": ObjectId(),
        "id": plan_id,
        "title": "Schema Verification Plan",
        "exam_date": "2026-07-09", # String format as in example
        "created_at": "2026-02-01", # String format as in example
        "daily_goal_hours": 2,
        "parallel_courses": 0,
        "study_days": [5, 6],
        "schedule": [], # Empty for simplicity, or we can add one day
        "user_id": "default-user" # Extra field to see if it causes issues (it shouldn't as we ignore extras if configured, strict otherwise)
    }
    
    # Clean up first
    store.plans_collection.delete_one({"id": plan_id})
    
    # Insert raw
    store.plans_collection.insert_one(raw_doc)
    print(f"✅ Inserted raw document with id: {plan_id}")

    # 2. Try to retrieve via store
    plan = store.get_plan(plan_id)
    
    if plan:
        print(f"✅ Retrieved plan: {plan.title}")
        print(f"   ID: {plan.id}")
        print(f"   Created At: {plan.created_at} (Type: {type(plan.created_at)})")
    else:
        print("❌ Failed to retrieve plan.")

    # 3. Test Save (Update)
    if plan:
        plan.title = "Updated Schema Verification Plan"
        store.save_plan(plan)
        print("✅ Saved updated plan.")
        
        # Verify persistence
        updated_doc = store.plans_collection.find_one({"id": plan_id})
        print(f"   Title in DB: {updated_doc.get('title')}")
        
        if updated_doc.get('title') == "Updated Schema Verification Plan":
            print("✅ Update verified.")
        else:
             print("❌ Update failed.")

except ImportError as e:
    print(f"❌ Import Error: {e}")
except Exception as e:
    print(f"❌ Error: {e}")
