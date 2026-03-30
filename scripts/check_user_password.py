import sys
import os

# Ensure we can import from local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.mongo_store import MongoStore

def check_password():
    print("🔍 Checking for hashed_password in MongoDB users...")
    try:
        store = MongoStore()
        # Get any user
        user_doc = store.users_collection.find_one({}, {'_id': 0})
        
        if not user_doc:
            print("❌ No users found in database.")
            return

        print(f"👤 Found user: {user_doc.get('email', 'UNKNOWN')}")
        if 'hashed_password' in user_doc:
            print(f"✅ hashed_password is present: {user_doc['hashed_password'][:10]}...")
        else:
            print("❌ hashed_password is MISSING!")
            print(f"   Keys found: {list(user_doc.keys())}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_password()
