from beanie import PydanticObjectId
from fastapi import FastAPI, Depends
from fastapi_injector import Injected
from typing import List

from app.models.api import BotResponse, CreateBotRequest, UpdateBotRequest
from app.services import BotsService
from app.utils.jwt_dependencies import jwt_required


def register(app: FastAPI):

    @app.get("/api/bots", response_model=List[BotResponse])
    async def get_bots(
        _ = Depends(jwt_required),
        bots_service = Injected(BotsService),
    ):
        return await bots_service.get_bots()


    @app.post("/api/bots")
    async def create_bot(
        body: CreateBotRequest,
        _ = Depends(jwt_required),
        bots_service = Injected(BotsService),
    ):
        bot = await bots_service.create_bot(body)
        return { "success": True, "id": str(bot.id) }


    @app.put("/api/bots/{bot_id}")
    async def update_bot(
        bot_id: PydanticObjectId,
        body: UpdateBotRequest,
        _ = Depends(jwt_required),
        bots_service = Injected(BotsService),
    ):
        await bots_service.update_bot(bot_id, body)
        return { "success": True, "id": str(bot_id) }
