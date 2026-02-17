"""
Migration script to transfer existing study plans from JSON to MongoDB
Run this once to migrate existing data
"""

import json
import os
from datetime import datetime
from services.mongodb_service import MongoDBService
from dotenv import load_dotenv

# Load environment variables
if os.path.exists("key.env"):
    load_dotenv("key.env")
if os.path.exists("mongodb.env"):
    load_dotenv("mongodb.env")

def migrate_json_to_mongodb():
    """Migrate plans from data/plans.json to MongoDB"""
    
    # Path to JSON file
    json_file = os.path.join("data", "plans.json")
    
    if not os.path.exists(json_file):
        print("[ERROR] No plans.json file found. Nothing to migrate.")
        return
    
    # Read JSON data
    try:
        with open(json_file, "r") as f:
            plans_data = json.load(f)
    except json.JSONDecodeError:
        print("[ERROR] Error reading plans.json - invalid JSON format")
        return
    
    if not plans_data:
        print("[INFO] plans.json is empty. Nothing to migrate.")
        return
    
    print(f"[INFO] Found {len(plans_data)} plans to migrate")
    
    # Connect to MongoDB
    try:
        mongo = MongoDBService()
        collection = mongo.db.study_plans
        print("[OK] Connected to MongoDB")
    except Exception as e:
        print(f"[ERROR] Failed to connect to MongoDB: {e}")
        return
    
    # Migrate each plan
    migrated_count = 0
    default_user_id = "default-user"
    
    for plan_data in plans_data:
        try:
            # Add MongoDB-specific fields
            plan_data['user_id'] = default_user_id
            plan_data['plan_id'] = plan_data['id']
            plan_data['updated_at'] = datetime.utcnow()
            
            # Insert into MongoDB (upsert to avoid duplicates)
            collection.update_one(
                {"user_id": default_user_id, "plan_id": plan_data['id']},
                {"$set": plan_data},
                upsert=True
            )
            
            migrated_count += 1
            print(f"[OK] Migrated plan: {plan_data.get('title', plan_data['id'])}")
            
        except Exception as e:
            print(f"[ERROR] Error migrating plan {plan_data.get('id', 'unknown')}: {e}")
    
    print(f"\n[SUCCESS] Migration complete! {migrated_count}/{len(plans_data)} plans migrated successfully")
    print(f"[INFO] All plans assigned to user: {default_user_id}")
    
    # Create backup of original JSON file
    backup_file = json_file + ".backup"
    try:
        import shutil
        shutil.copy2(json_file, backup_file)
        print(f"[OK] Backup created: {backup_file}")
    except Exception as e:
        print(f"[WARNING] Could not create backup: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("CLeviAI - JSON to MongoDB Migration Script")
    print("=" * 60)
    print()
    
    migrate_json_to_mongodb()
    
    print()
    print("=" * 60)
    print("Migration process finished")
    print("=" * 60)
