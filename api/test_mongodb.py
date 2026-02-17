"""
Quick test script to verify MongoDB connection
"""

import sys
import os

# Add parent directory to path to import services
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv

# Load environment variables
if os.path.exists("key.env"):
    load_dotenv("key.env")
if os.path.exists("mongodb.env"):
    load_dotenv("mongodb.env")

from services.mongodb_service import MongoDBService

def test_connection():
    print("Testing MongoDB connection...")
    print("=" * 60)
    
    try:
        mongo = MongoDBService()
        health = mongo.health_check()
        
        print(f"Status: {health['status']}")
        print(f"Database: {health.get('database', 'N/A')}")
        print(f"Connected: {health['connected']}")
        
        if health['connected']:
            print("\n[OK] MongoDB connection successful!")
            
            # Test collection access
            collection = mongo.db.study_plans
            count = collection.count_documents({})
            print(f"[INFO] Current plans in database: {count}")
        else:
            print(f"\n[ERROR] Connection failed: {health.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_connection()
