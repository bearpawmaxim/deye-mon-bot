from fastapi import Depends, FastAPI, HTTPException, status
from fastapi_injector import Injected
from pydantic import BaseModel
from app.services import Services
from app.services.authorization import AuthorizationService
from app.utils.jwt_dependencies import jwt_refresh_required, jwt_required

class LoginRequest(BaseModel):
    userName: str
    password: str


class SaveProfileRequest(BaseModel):
    userId: int
    userName: str


class StartPasswordChangeRequest(BaseModel):
    userName: str


class CancelPasswordChangeRequest(BaseModel):
    userName: str


class ChangePasswordRequest(BaseModel):
    resetToken: str
    newPassword: str


def register(app: FastAPI, services: Services):
    @app.post("/api/auth/login")
    def login(body: LoginRequest, authorization: AuthorizationService = Injected(AuthorizationService)):
        try:
            access_token, refresh_token = authorization.login(
                body.userName, body.password
            )
            return {
                "success": True,
                "accessToken": access_token,
                "refreshToken": refresh_token
            }
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    @app.get("/api/auth/profile")
    def profile(claims=Depends(jwt_required)):
        current_user = claims["sub"]
        user = services.database.get_user(current_user)
        if user is None:
            raise HTTPException(status_code=400, detail="Cannot find user")

        return {"success": True, "userName": user.name, "userId": user.id}

    @app.post("/api/auth/saveProfile")
    def save_profile(body: SaveProfileRequest, claims=Depends(jwt_required), authorization: AuthorizationService = Injected(AuthorizationService)):
        authorization.update_user(body.userId, body.userName)
        return {"success": True}

    @app.post("/api/auth/startPasswordChange")
    def start_password_change(
        body: StartPasswordChangeRequest,
        claims=Depends(jwt_required),
        authorization: AuthorizationService = Injected(AuthorizationService)
    ):
        try:
            token = authorization.start_change_password(body.userName, hours=2.5)
            return {"success": True, "resetToken": token}
        except ValueError as e:
            raise HTTPException(status_code=500, detail="Error changing password")

    @app.post("/api/auth/cancelPasswordChange")
    def cancel_password_change(
        body: CancelPasswordChangeRequest,
        claims=Depends(jwt_required),
        authorization: AuthorizationService = Injected(AuthorizationService)
    ):
        try:
            authorization.cancel_change_password(body.userName)
            return {"success": True}
        except ValueError as e:
            raise HTTPException(status_code=500, detail="Error changing password")

    @app.post("/api/auth/changePassword")
    def change_password(
        body: ChangePasswordRequest,
        authorization: AuthorizationService = Injected(AuthorizationService)
    ):
        if not body.resetToken or not body.newPassword:
            raise HTTPException(status_code=400, detail="Invalid request")
        try:
            authorization.change_password(body.resetToken, body.newPassword)
            return {"success": True}
        except ValueError as e:
            raise HTTPException(status_code=401, detail=str(e))

    @app.post("/api/auth/refresh")
    def refresh(
        claims=Depends(jwt_refresh_required),
        authorization: AuthorizationService = Injected(AuthorizationService)
    ):
        identity = claims["sub"]
        access_token = authorization.refresh_token(identity)
        refresh_token = claims.get("refresh_token", None)
        return {"success": True, "accessToken": access_token, "refreshToken": refresh_token}
