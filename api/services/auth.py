from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
import uuid

try:
    from ..models import UserInDB, UserCreate, User
    from .mongo_store import MongoStore
except ImportError:
    from models import UserInDB, UserCreate, User
    from services.mongo_store import MongoStore

# Secret key to sign JWTs (should be in env vars in prod)
SECRET_KEY = "supersecretkey_change_me_in_prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

class AuthService:
    def __init__(self):
        self.store = MongoStore()

    def get_users(self) -> List[User]:
        # MongoStore returns User objects, but for auth we sometimes treat them as UserInDB if we had password hash
        # Actually User model has hashed_password? Check models.py
        # UserInDB inherits from User and adds hashed_password.
        # MongoStore.get_all_users returns User objects (which might have hashed_password if stored)
        # Let's ensure we return what's expected.
        # Models:
        # class User(BaseModel): ...
        # class UserInDB(User): hashed_password: str
        
        # When we load from Mongo, the dict includes hashed_password.
        # So we should be able to instantiate UserInDB from the dict.
        
        # However, MongoStore.get_all_users currently returns List[User].
        # We might need to adjust MongoStore to be generic or just cast here.
        
        # Let's use the store directly for raw access if needed, or update store to return dicts?
        # Better: Update MongoStore methods to return UserInDB if that's what we stored.
        # But UserInDB is sensitive.
        
        # For get_users (admin list), we usually return User (safe).
        # For login, we need UserInDB.
        
        # Let's rely on MongoStore returning objects that contain all fields in DB.
        # If we save UserInDB as dict, it has hashed_password.
        # When we load it as User, Pydantic might strip extra fields if not configured to allow extra?
        # User model implies strict fields.
        
        # Check models.py: User does NOT have hashed_password. UserInDB DOES.
        # So MongoStore.get_user returns User (no password).
        # We need a method to get UserInDB for login.
        
        return self.store.get_all_users()

    def save_user(self, user: UserInDB):
        # We save UserInDB which includes password
        self.store.save_user(user)

    def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        # We need the password for login verification
        # MongoStore.get_user_by_email returns User.
        # We need to bypass or update MongoStore to return full document for Auth.
        
        doc = self.store.users_collection.find_one({'email': email}, {'_id': 0})
        if doc:
            return UserInDB(**doc)
        return None

    def verify_password(self, plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password):
        return pwd_context.hash(password)

    def create_user(self, user_create: UserCreate) -> UserInDB:
        hashed_password = self.get_password_hash(user_create.password)
        user_db = UserInDB(
            id=str(uuid.uuid4()),
            email=user_create.email,
            full_name=user_create.full_name,
            role="user",
            hashed_password=hashed_password,
            disabled=False,
            tier="standard"
        )
        self.save_user(user_db)
        return user_db

    def update_user(self, user_id: str, updates: dict) -> bool:
        # Validate role and tier if provided
        if "role" in updates and updates["role"] not in ["user", "admin"]:
            return False
        if "tier" in updates and updates["tier"] not in ["standard", "pro"]:
             return False

        # If updating password, hash it
        if "password" in updates:
            updates["hashed_password"] = self.get_password_hash(updates.pop("password"))

        return self.store.update_user(user_id, updates)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def delete_user(self, user_id: str) -> bool:
        return self.store.delete_user(user_id)
