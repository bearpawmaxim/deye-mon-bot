from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from app.services import Services
from app.utils.jwt_dependencies import jwt_required

# Pydantic models for request/response
class SaveBotRequest(BaseModel):
    id: Optional[int] = None
    token: str
    enabled: bool = False
    hookEnabled: bool = False

class BotResponse(BaseModel):
    id: int
    name: str
    token: str
    enabled: bool
    hookEnabled: bool


def register(app: FastAPI, services: Services):

    @app.post("/api/bots/bots", response_model=List[BotResponse])
    def get_bots(claims=Depends(jwt_required)):
        bots = services.database.get_bots(all=True)

        def process_bot(bot):
            bot_name = "Invalid bot token"
            try:
                bot_name = services.telegram.get_bot_info(bot.id).username
            except Exception:
                print(f"Cannot get bot info for bot {bot.id}")
            return BotResponse(
                id=bot.id,
                name=bot_name,
                token=bot.bot_token,
                enabled=bot.enabled,
                hookEnabled=bot.hook_enabled,
            )

        futures = [services.executor.submit(process_bot, bot) for bot in bots]
        bots_list = [future.result() for future in futures]

        return bots_list

    @app.put("/api/bots/save")
    def save_bot(body: SaveBotRequest, claims=Depends(jwt_required)):
        bot_id = services.database.save_bot(
            body.id, body.token, body.enabled, body.hookEnabled
        )
        services.database.save_changes()

        if body.enabled:
            services.telegram.add_bot(bot_id, body.token)
        else:
            services.telegram.remove_bot(bot_id)

        return {"success": True, "id": bot_id}
