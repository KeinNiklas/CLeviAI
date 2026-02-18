
import os
import sys

# Add api to path
sys.path.append(os.path.join(os.getcwd(), "api"))

# Loading env
from dotenv import load_dotenv
if os.path.exists("api/mongodb.env"):
    with open("api/mongodb.env", "r") as f:
        content = f.read().strip()
    if content.startswith("mongodb"):
         os.environ["MONGODB_TEST_URI"] = content
    else:
         load_dotenv("api/mongodb.env")

try:
    from api.services.mongo_store import MongoStore
    store = MongoStore()
    print(f"✅ MongoStore initialized successfully.")
    print(f"   Collection: {store.plans_collection.name}")
    print(f"   Database: {store.db.name}")
except ImportError:
    print("❌ Failed to import MongoStore. Check dependencies.")
except ValueError as e:
    print(f"❌ Configuration Error: {e}")
except Exception as e:
    print(f"❌ Error: {e}")
