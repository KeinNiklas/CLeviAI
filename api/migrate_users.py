import sys
import os
import json
from dotenv import load_dotenv

# Ensure we can import from local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.mongo_store import MongoStore
from models import UserInDB

def load_mongo_env():
    if os.path.exists("mongodb.env"):
        with open("mongodb.env", "r") as f:
            content = f.read().strip()
        if content.startswith("mongodb"):
             os.environ["MONGODB_TEST_URI"] = content
        else:
             load_dotenv("mongodb.env")

def migrate():
    print("🚀 Starting User Migration...")
    load_mongo_env()
    
    try:
        store = MongoStore()
        print("✅ Connected to MongoDB.")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        return

    users_path = os.path.join("data", "users.json")
    if not os.path.exists(users_path):
         print(f"❌ Users file not found at {users_path}")
         return
    
    with open(users_path, "r") as f:
        users_data = json.load(f)
        
    print(f"📂 Found {len(users_data)} users in {users_path}")
    
    count = 0
    errors = 0
    
    for user_data in users_data:
        try:
            # Validate and Create User Object
            # Use UserInDB to include hashed_password
            user = UserInDB(**user_data)
            
            # Save to MongoDB
            store.save_user(user)
            print(f"   ok: {user.email}")
            count += 1
        except Exception as e:
            print(f"   ❌ Error migrating {user_data.get('email', 'UNKNOWN')}: {e}")
            errors += 1
            
    print(f"\n✨ Migration Complete.")
    print(f"✅ Successfully migrated: {count}")
    print(f"❌ Errors: {errors}")

if __name__ == "__main__":
    migrate()
