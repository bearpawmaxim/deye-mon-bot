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
