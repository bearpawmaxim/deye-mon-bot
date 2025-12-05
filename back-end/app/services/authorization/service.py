from datetime import datetime, timezone, timedelta
import secrets
from typing import Any, Dict, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from injector import inject
from jose import jwt, JWTError
from passlib.context import CryptContext

from app.settings import Settings
from app.services.database.service import DatabaseService
from app.models import User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"

@inject
class AuthorizationService:
    def __init__(self, database: DatabaseService, settings: Settings):
        self._database = database
        self._settings: Settings = settings

    def create_access_token(
        self,
        identity: str,
        expires: timedelta,
        additional_claims: Optional[Dict[str, Any]] = None
    ):
        now = datetime.now(timezone.utc)
        
        expiration = now + expires
        payload = {
            "sub": identity,
            "type": "access",
            "iat": now,
        }

        if expires is not None:
            expiration = now + expires
            payload["exp"] = expiration

        if additional_claims:
            payload.update(additional_claims)

        return jwt.encode(payload, self._settings.JWT_SECRET_KEY, algorithm=ALGORITHM)

    def create_refresh_token(self, identity: str, expires: timedelta):
        now = datetime.now(timezone.utc)
        expiration = now + expires
        payload = {
            "sub": identity,
            "type": "refresh",
            "iat": now,
            "exp": expiration,
        }
        return jwt.encode(payload, self._settings.JWT_SECRET_KEY, algorithm=ALGORITHM)

    def decode_token(self, token: str) -> dict:
        return jwt.decode(
            token,
            self._settings.JWT_SECRET_KEY,
            algorithms=[ALGORITHM]
        )

    async def get_current_user(self, token: str = Depends(oauth2_scheme)) -> str:
        credentials_error = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

        try:
            payload = jwt.decode(token, self._settings.JWT_SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                raise credentials_error

            return username
        except JWTError:
            raise credentials_error


    def _get_user(self, user_name: str, password: str):
        user = self._database.get_user(user_name)
        if not user:
            raise ValueError("User not found")
        if user.is_reporter:
            raise ValueError("Reporter cannot log in")
        if not pwd_context.verify(password, user.password):
            raise ValueError("Invalid password")
        return user

    def login(self, user_name: str, password: str):
        user = self._get_user(user_name, password)

        access = self.create_access_token(
            user.name,
            self._settings.JWT_ACCESS_TOKEN_EXPIRES,
        )

        refresh = self.create_refresh_token(
            user.name,
            self._settings.JWT_REFRESH_TOKEN_EXPIRES,
        )

        return access, refresh

    def refresh_token(self, user_name):
        user = self._database.get_user(user_name)
        if not user:
            raise ValueError("User not found")
        if user.is_reporter:
            raise ValueError("Reporter cannot log in")

        return self.create_access_token(
            user.name,
            self._settings.JWT_REFRESH_TOKEN_EXPIRES,
        )

    def _generate_passwd_reset_token(self, user: User, hours: int):
        user.password_reset_token = secrets.token_urlsafe(64)
        user.reset_token_expiration = (
            datetime.now(timezone.utc) + timedelta(hours=hours)
        )
        self._database.save_changes()
        return user.password_reset_token

    def start_change_password(self, user_name: str, hours: int = 1):
        user = self._database.get_user(user_name)
        if not user:
            raise ValueError("User not found")
        return self._generate_passwd_reset_token(user, hours)

    def change_password(self, token: str, new_password: str):
        user = self._database.get_user_by_reset_token(token)
        if not user:
            raise ValueError("Invalid token")

        if user.reset_token_expiration < datetime.utcnow():
            raise ValueError("Token expired")

        user.password_reset_token = None
        user.reset_token_expiration = None
        user.password = pwd_context.hash(new_password)
        self._database.save_changes()


    def _validate_reset_token(self, user: User):
        expiration = user.reset_token_expiration

        if expiration.tzinfo is None:
            expiration = expiration.replace(tzinfo=timezone.utc)

        if expiration < datetime.now(timezone.utc):
            user.password_reset_token = None
            user.reset_token_expiration = None
            self._database.save_changes()
            raise ValueError("Token expired")

        return user

    def create_reporter_token(self, user_name: str):
        return self.create_access_token(
            identity          = user_name,
            expires_minutes   = None,
            additional_claims = {
                "is_reporter": True
            }
        )

    def add_user(self, user_name: str, password: str):
        hashed = pwd_context.hash(password)
        self._database.create_user(user_name, hashed)

    def start_change_password(self, user_name: str, hours: int = 1):
        user = self._database.get_user(user_name)
        if user is None:
            raise ValueError(f"Cannot find user '{user_name}'")

        return self._generate_passwd_reset_token(user, hours)

    def cancel_change_password(self, user_name: str):
        user = self._database.get_user(user_name)
        if user is None:
            raise ValueError(f"Cannot find user '{user_name}'")

        user.password_reset_token = None
        user.reset_token_expiration = None
        self._database.save_changes()

    def change_password(self, token: str, new_password: str):
        user = self._database.get_user_by_reset_token(token)
        if user is None:
            raise ValueError("Cannot find user")

        self._validate_reset_token(user)

        hashed_new_password = pwd_context.hash(new_password)
        self._database.change_password(user.id, hashed_new_password)

    def update_user(self, user_id: int, user_name: str):
        self._database.update_user(user_id, user_name)
