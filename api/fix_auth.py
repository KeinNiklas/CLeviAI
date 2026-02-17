"""
Test different MongoDB connection approaches to diagnose authentication issue
"""

import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

# Load environment variables
if os.path.exists("mongodb.env"):
    load_dotenv("mongodb.env")

print("MongoDB Authentication Troubleshooting")
print("=" * 60)

# Original URI
original_uri = os.getenv("MONGODB_URI")
print(f"\n1. Original URI from env:")
print(f"   {original_uri}")

# Try URL encoding the password
username = "Vercel-Admin-clavidb"
password = "MongoZDT"
cluster = "clavidb.qkkcbfh.mongodb.net"
database = "cleviaidb"

# URL encode password
encoded_password = quote_plus(password)
print(f"\n2. URL-encoded password: {encoded_password}")

# Build new URI with encoded password
encoded_uri = f"mongodb+srv://{username}:{encoded_password}@{cluster}/?retryWrites=true&w=majority&appName=clavidb"
print(f"\n3. New URI with encoded password:")
print(f"   mongodb+srv://{username}:***@{cluster}/?retryWrites=true&w=majority&appName=clavidb")

# Test connection with encoded URI
print("\n" + "=" * 60)
print("Testing connection with URL-encoded password...")
print("=" * 60)

try:
    from pymongo.mongo_client import MongoClient
    from pymongo.server_api import ServerApi
    
    client = MongoClient(encoded_uri, server_api=ServerApi('1'))
    client.admin.command('ping')
    print("[SUCCESS] Connected with URL-encoded password!")
    
    # Test database access
    db = client[database]
    collection = db.study_plans
    count = collection.count_documents({})
    print(f"[INFO] Plans in database: {count}")
    
    client.close()
    
    # Save working URI to file
    print("\n[ACTION] Saving working URI to mongodb.env...")
    with open("mongodb.env", "w") as f:
        f.write(f"MONGODB_URI={encoded_uri}\n")
        f.write(f"MONGODB_DATABASE={database}\n")
    print("[SUCCESS] mongodb.env updated with working URI!")
    
except Exception as e:
    print(f"[ERROR] Connection failed: {e}")
    print("\nPlease verify in MongoDB Atlas:")
    print("1. Database user exists: Vercel-Admin-clavidb")
    print("2. Password is correct: MongoZDT")
    print("3. User has 'readWrite' role on 'cleviaidb' database")
    print("4. Network Access allows your IP (or 0.0.0.0/0)")
