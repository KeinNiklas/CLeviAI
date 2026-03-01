import sys
import os
import time

# Ensure we can import from local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.auth import AuthService
from models import UserCreate, UserInDB
from dotenv import load_dotenv

# Load env
if os.path.exists("mongodb.env"):
    with open("mongodb.env", "r") as f:
        content = f.read().strip()
    if content.startswith("mongodb"):
            os.environ["MONGODB_TEST_URI"] = content
    else:
            load_dotenv("mongodb.env")

def verify_auth():
    print("🔐 Verifying MongoDB Auth...")
    
    try:
        auth = AuthService()
        print("✅ AuthService initialized.")
    except Exception as e:
        print(f"❌ Failed to init AuthService: {e}")
        return

    # 1. Create a Test User
    email = f"test_auth_{int(time.time())}@example.com"
    password = "securepassword123"
    
    print(f"👉 Creating user: {email}")
    try:
        user_create = UserCreate(email=email, password=password, full_name="Auth Tester")
        user = auth.create_user(user_create)
        print(f"✅ User created with ID: {user.id}")
    except Exception as e:
        print(f"❌ Failed to create user: {e}")
        return

    # 2. Retrieve User by Email
    print(f"👉 Retrieving user by email...")
    fetched_user = auth.get_user_by_email(email)
    if fetched_user and fetched_user.id == user.id:
        print(f"✅ User retrieved successfully (Role: {fetched_user.role}).")
    else:
        print(f"❌ User retrieval failed.")
        return

    # 3. Verify Password
    print(f"👉 Verifying password...")
    if auth.verify_password(password, fetched_user.hashed_password):
        print(f"✅ Password verified.")
    else:
        print(f"❌ Password verification failed.")
        return

    # 4. Generate Token
    print(f"👉 Generating token...")
    token = auth.create_access_token({"sub": email})
    if token:
        print(f"✅ Token generated: {token[:20]}...")
    else:
        print(f"❌ Token generation failed.")

    # 5. Clean Up
    print(f"👉 Cleaning up...")
    if auth.delete_user(user.id):
        print(f"✅ User deleted.")
    else:
        print(f"❌ Failed to delete user.")

    print("\n✨ Auth Verification Complete.")

if __name__ == "__main__":
    verify_auth()
