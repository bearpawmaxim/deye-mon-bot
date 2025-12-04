from fastapi import Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi_injector import Injected
from starlette.status import HTTP_403_FORBIDDEN, HTTP_401_UNAUTHORIZED

from app.services.authorization import AuthorizationService


security = HTTPBearer()   

def get_current_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    authorization: AuthorizationService = Injected(AuthorizationService),
):
    token = credentials.credentials
    try:
        return authorization.decode_token(token)
    except Exception:
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
    authorization: AuthorizationService = Injected(AuthorizationService),
):
    if token is None:
        return None

    try:
        return authorization.decode_token(token)
    except Exception:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

def is_authenticated(claims: dict | None) -> bool:
    return claims is not None and claims.get("sub") is not None

def get_identity(claims: dict | None):
    return claims.get("sub") if claims else None
