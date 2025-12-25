from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from jose import jwt, JWTError


ALGORITHM = "HS256"

class InvalidTokenError(Exception):
    pass


def decode_jwt(token: str, secret_key: str) -> dict:
    try:
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
    except JWTError as e:
        raise InvalidTokenError(str(e))

    return payload


def ensure_access_token(payload: dict):
    if payload.get("type") != "access":
        raise InvalidTokenError("Access token required")


def ensure_refresh_token(payload: dict):
    if payload.get("type") != "refresh":
        raise InvalidTokenError("Refresh token required")


def ensure_not_reporter(payload: dict):
    if payload.get("is_reporter", False):
        raise InvalidTokenError("Reporter token not allowed here")


def create_access_token(
    identity: str,
    expires: timedelta,
    secret_key: str,
    additional_claims: Optional[Dict[str, Any]] = None
):
    now = datetime.now(timezone.utc)
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

    return jwt.encode(payload, secret_key, algorithm=ALGORITHM)


def create_refresh_token(
    identity: str,
    expires: timedelta,
    secret_key: str,    
):
    now = datetime.now(timezone.utc)
    expiration = now + expires
    payload = {
        "sub": identity,
        "type": "refresh",
        "iat": now,
        "exp": expiration,
    }
    return jwt.encode(payload, secret_key, algorithm=ALGORITHM)
