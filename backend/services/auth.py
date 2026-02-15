from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import json
import os
from models import UserInDB, UserCreate
import uuid

# Secret key to sign JWTs (should be in env vars in prod)
SECRET_KEY = "supersecretkey_change_me_in_prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

USERS_FILE = os.path.join(os.path.dirname(__file__), "../data/users.json")

class AuthService:
    def __init__(self):
        self.users_file = USERS_FILE
        self._ensure_users_file()

    def _ensure_users_file(self):
        if not os.path.exists(self.users_file):
            with open(self.users_file, "w") as f:
                json.dump([], f)

    def get_users(self):
        with open(self.users_file, "r") as f:
            try:
                data = json.load(f)
                return [UserInDB(**user) for user in data]
            except json.JSONDecodeError:
                return []

    def save_user(self, user: UserInDB):
        users = self.get_users()
        users.append(user)
        with open(self.users_file, "w") as f:
            json.dump([u.model_dump() for u in users], f, indent=4)

    def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        users = self.get_users()
        for user in users:
            if user.email == email:
                return user
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
            disabled=False
        )
        self.save_user(user_db)
        return user_db

    def update_user(self, user_id: str, updates: dict) -> bool:
        users = self.get_users()
        found_user_index = -1
        found_user = None

        for i, user in enumerate(users):
            if user.id == user_id:
                found_user_index = i
                found_user = user
                break

        if found_user_index == -1:
            return False # User not found

        # Validate role and tier if provided
        if "role" in updates and updates["role"] not in ["user", "admin"]:
            return False
        if "tier" in updates and updates["tier"] not in ["standard", "pro"]:
             return False

        updated_user = found_user.model_copy(update=updates)
        
        # Replace in list
        users[found_user_index] = updated_user
        
        # Save
        with open(self.users_file, "w") as f:
            json.dump([u.model_dump() for u in users], f, indent=4)
            
        return True

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
        users = self.get_users()
        remaining_users = [u for u in users if u.id != user_id]
        
        if len(users) != len(remaining_users):
            with open(self.users_file, "w") as f:
                json.dump([u.model_dump() for u in remaining_users], f, indent=4)
            return True
        return False
