from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
try:
    from services.auth import AuthService, SECRET_KEY, ALGORITHM
    from models import UserInDB
except ImportError:
    from .services.auth import AuthService, SECRET_KEY, ALGORITHM
    from .models import UserInDB

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")
auth_service = AuthService()

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        print(f"[DEBUG Python] Verifying token: {token[:20]}...")
        print(f"[DEBUG Python] Using SECRET_KEY for validation: {SECRET_KEY[:4]}...{SECRET_KEY[-4:]}")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            print("[DEBUG Python] Validation failed: Subject (sub/email) is missing in payload")
            raise credentials_exception
    except JWTError as e:
        print(f"[DEBUG Python] JWTError during validation: {str(e)}")
        raise credentials_exception
    
    user = auth_service.get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user
