from fastapi import FastAPI, Depends, Request, HTTPException
from app.services import Services
from app.utils.jwt_dependencies import jwt_required
from shared.utils import generate_api_token


def register(app: FastAPI, services: Services):

    @app.post("/api/users/users")
    async def get_users(current_user=Depends(jwt_required)):
        users = services.database.get_users(all=True)
        current_name = current_user["sub"] if isinstance(current_user, dict) else current_user

        result = [
            {
                "id": u.id,
                "name": u.name,
                "isActive": u.is_active,
                "isReporter": u.is_reporter,
                "apiKey": u.api_key,
            }
            for u in users 
            if u.name != current_name
        ]

        return result

    @app.put("/api/users/save")
    async def save_user(request: Request, current_user=Depends(jwt_required)):
        body = await request.json()

        id = body.get("id")
        name = body.get("name")
        password = body.get("password")
        is_active = body.get("isActive", True)
        is_reporter = body.get("isReporter", False)

        hashed_password = None
        if password:
            hashed_password = (
                services.authorization._bcrypt
                .generate_password_hash(password)
                .decode("utf-8")
            )

        user_id = services.database.save_user(
            id, name, hashed_password, is_active, is_reporter
        )
        services.database.save_changes()
        # Generate reset token only for new non-reporter user
        reset_token = None
        if not id and user_id and not is_reporter:
            user = services.database.get_user_by_id(user_id)
            if user:
                reset_token = services.authorization._generate_passwd_reset_token(
                    user, hours=2.5
                )

        return {
            "success": True,
            "id": user_id,
            "resetToken": reset_token,
        }

    @app.delete("/api/users/delete/{user_id}")
    async def delete_user(user_id: int, current_user=Depends(jwt_required)):
        success = services.database.delete_user(user_id)
        services.database.save_changes()

        if not success:
            raise HTTPException(status_code=404, detail="User not found")

        return {"success": True}

    @app.post("/api/users/generate-token/{user_id}")
    async def generate_token(user_id: int, current_user=Depends(jwt_required)):
        user = services.database.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.is_reporter:
            jwt_token = services.authorization.create_reporter_token(user.name)
            result = services.database.save_user_api_token(user_id, jwt_token)
        else:
            token = generate_api_token()
            result = services.database.save_user_api_token(user_id, token)

        services.database.save_changes()

        if not result:
            raise HTTPException(status_code=500, detail="Failed to generate token")

        return {"success": True, "token": result}

    @app.delete("/api/users/delete-token/{user_id}")
    async def delete_token(user_id: int, current_user=Depends(jwt_required)):
        success = services.database.delete_user_api_token(user_id)
        services.database.save_changes()

        if not success:
            raise HTTPException(status_code=404, detail="Token not found")

        return {"success": True}
