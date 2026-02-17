"""
MongoDB Service for CLeviAI
Handles connection and operations with MongoDB Atlas
"""

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pymongo import ASCENDING
import os
from typing import Optional


class MongoDBService:
    """Singleton service for MongoDB operations"""
    
    _instance: Optional['MongoDBService'] = None
    _client: Optional[MongoClient] = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize MongoDB connection"""
        if self._client is None:
            self._connect()
    
    def _connect(self):
        """Establish connection to MongoDB Atlas"""
        try:
            # Get MongoDB URI from environment
            uri = os.getenv("MONGODB_URI")
            if not uri:
                raise ValueError("MONGODB_URI not found in environment variables")
            
            # Get database name from environment (default: cleviaidb)
            db_name = os.getenv("MONGODB_DATABASE", "cleviaidb")
            
            # Create client with server API version
            self._client = MongoClient(uri, server_api=ServerApi('1'))
            
            # Test connection
            self._client.admin.command('ping')
            print(f"[OK] Successfully connected to MongoDB Atlas!")
            
            # Get database reference
            self._db = self._client[db_name]
            
            # Create indexes for better performance
            self._create_indexes()
            
        except Exception as e:
            print(f"[ERROR] MongoDB connection failed: {e}")
            raise
    
    def _create_indexes(self):
        """Create indexes for optimal query performance"""
        try:
            # Index on user_id for fast user-specific queries
            self._db.study_plans.create_index([("user_id", ASCENDING)])
            
            # Compound index on user_id and plan_id for fast lookups
            self._db.study_plans.create_index([
                ("user_id", ASCENDING),
                ("plan_id", ASCENDING)
            ])
            
            print("[OK] Database indexes created successfully")
        except Exception as e:
            print(f"[WARNING] Index creation warning: {e}")
    
    @property
    def db(self):
        """Get database reference"""
        if self._db is None:
            self._connect()
        return self._db
    
    @property
    def client(self):
        """Get MongoDB client"""
        if self._client is None:
            self._connect()
        return self._client
    
    def health_check(self) -> dict:
        """Check MongoDB connection health"""
        try:
            self._client.admin.command('ping')
            return {
                "status": "healthy",
                "database": self._db.name,
                "connected": True
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "connected": False
            }
    
    def close(self):
        """Close MongoDB connection"""
        if self._client:
            self._client.close()
            print("MongoDB connection closed")
