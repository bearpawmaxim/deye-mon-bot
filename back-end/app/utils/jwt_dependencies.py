from fastapi import Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi_injector import Injected
from starlette.status import HTTP_403_FORBIDDEN, HTTP_401_UNAUTHORIZED

from app.settings import Settings
from shared.utils.jwt_utils import decode_jwt, InvalidTokenError


security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)   

def get_current_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    settings: Settings = Injected(Settings),
):
    token = credentials.credentials
    try:
        return decode_jwt(token, settings.JWT_SECRET_KEY)
    except InvalidTokenError:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired JWT token"
        )

def jwt_required(current_claims: dict = Depends(get_current_jwt)):
    if current_claims.get("is_reporter", False):
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail="Reporter users can only access /api/ext-data/grid-power"
        )
    return current_claims

def jwt_refresh_required(current_claims: dict = Depends(get_current_jwt)):
    if current_claims.get("type") != "refresh":
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail="Refresh token required"
        )
    return current_claims

def jwt_reporter_only(current_claims: dict = Depends(get_current_jwt)):
    if not current_claims.get("is_reporter", False):
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail="This endpoint is only accessible for reporter users"
        )
    return current_claims

def get_jwt_from_query(
    token: str | None = Query(default=None),
    settings: Settings = Injected(Settings),
):
    if token is None:
        return None

    try:
        return decode_jwt(token, settings.JWT_SECRET_KEY)
    except Exception:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

def is_authenticated(claims: dict | None) -> bool:
    return claims is not None and claims.get("sub") is not None

def get_identity(claims: dict | None):
    return claims.get("sub") if claims else None

def get_current_jwt_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_optional),
    settings: Settings = Injected(Settings),
):
    """Optional JWT verification - returns None if no token provided, 
    but validates the token if one is present."""
    if credentials is None:
        return None
    
    token = credentials.credentials
    try:
        return decode_jwt(token, settings.JWT_SECRET_KEY)
    except InvalidTokenError:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired JWT token"
        )
