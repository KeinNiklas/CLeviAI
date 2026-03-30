import sys
import os
import uuid

# Ensure we can import from local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.mongo_store import MongoStore
from models import User

def verify_update():
    print("🔍 Verifying Admin Update Functionality...")
    try:
        store = MongoStore()
        
        # 1. Create a dummy user
        user_id = str(uuid.uuid4())
        test_user = User(
            id=user_id,
            email=f"update_test_{user_id[:8]}@example.com",
            full_name="Update Test",
            role="user",
            disabled=False,
            tier="standard"
        )
        store.save_user(test_user)
        print(f"✅ Created test user: {test_user.email}")
        
        # 2. Update the user
        updates = {"role": "admin", "disabled": True}
        print(f"👉 Updating user with: {updates}")
        success = store.update_user(user_id, updates)
        
        if success:
            print("✅ Update reported success.")
        else:
            print("❌ Update reported failure!")
            return

        # 3. Verify update
        updated_user = store.get_user(user_id)
        if updated_user.role == "admin" and updated_user.disabled == True:
            print(f"✅ User successfully updated: Role={updated_user.role}, Disabled={updated_user.disabled}")
        else:
            print(f"❌ User update failed! Got: Role={updated_user.role}, Disabled={updated_user.disabled}")

        # 4. Cleanup
        store.delete_user(user_id)
        print("✅ Cleanup complete.")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    verify_update()
