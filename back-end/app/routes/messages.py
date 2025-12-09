from typing import List, Optional
from beanie import PydanticObjectId
from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi_injector import Injected
from pydantic import BaseModel, Field

from app.models.api import (
    MessageListResponseModel,
    MessageEditResponseModel,
    MessageUpdateRequest,
    MessageCreateRequest,
)
from app.services import Services, MessagesService, BotsService, StationsService
from app.utils.jwt_dependencies import jwt_required
from shared.models.beanie.message import Message

class MessagePreviewRequest(BaseModel):
    name: str
    #channel_id: str = Field(alias="channelId")
    message_template: str = Field(alias="messageTemplate")
    timeout_template: str = Field(alias="timeoutTemplate")
    should_send_template: Optional[str] = Field(None, alias="shouldSendTemplate")
    stations: List[PydanticObjectId]
    #bot_id: PydanticObjectId = Field(alias="botId")

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }


class SaveMessageStateRequest(BaseModel):
    enabled: bool = False


def register(app: FastAPI, services: Services):

    def _get_bot_name(bot_id: str):
        try:
            return services.telegram.get_bot_info(bot_id).username
        except:
            print(f'Cannot get bot info for bot {bot_id}')
            return 'Invalid bot identifier'

    def _get_channel_name(channel_id: str, bot_id: str):
        try:
            chat_info = services.telegram.get_chat_info(channel_id, bot_id)
            return chat_info.title
        except Exception as e:
            print(f'Cannot get channel info for channel {channel_id}: {str(e)}')
            return 'Invalid channel identifier'


    @app.get("/api/messages/messages")
    async def get_messages(
        _ = Depends(jwt_required),
        messages = Injected(MessagesService)
    ) -> List[MessageListResponseModel]:
        return await messages.get_messages(all=True)


    @app.post("/api/messages/getChannel")
    def get_channel(
        channel_id: str = Body(..., alias="channelId"), 
        bot_id: PydanticObjectId = Body(..., alias="botId"), 
        _ = Depends(jwt_required),
    ):
        if not channel_id or not bot_id:
            raise HTTPException(status_code=400, detail="channelId and botId should be specified")
        channel_name = _get_channel_name(channel_id, bot_id)
        return { 'success': True, 'channelName': channel_name }


    @app.get("/api/messages/message/{message_id}")
    async def get_message(
        message_id: PydanticObjectId,
        _ = Depends(jwt_required),
        messages = Injected(MessagesService)
    ) -> MessageEditResponseModel:
        return await messages.get_message(message_id)


    @app.post("/api/messages/getPreview")
    async def get_message_preview(
        body: MessagePreviewRequest,
        _ = Depends(jwt_required),
        bots = Injected(BotsService),
        stations_service = Injected(StationsService),
    ):
        server_stations = await stations_service.get_stations()
        id_set = set(body.stations)
        stations = [s for s in server_stations if s.id in id_set]

        #bot = await bots.get_bot(body.bot_id)

        message = Message(
            name                 = body.name,
            #channel_id           = body.channel_id,
            message_template     = body.message_template,
            timeout_template     = body.timeout_template,
            should_send_template = body.should_send_template,
            stations             = stations,
            #bot                  = bot
        )

        try:
            info = await bots.get_message(message)
            if info is None:
                raise HTTPException(status_code=500, detail="Failed to generate preview")
            return {
                'success': True,
                'message': info.message,
                'shouldSend': info.should_send,
                'timeout': info.timeout,
                'nextSendTime': info.next_send_time,
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


    @app.patch("/api/messages/{message_id}/state")
    async def save_message_state(
        message_id: PydanticObjectId,
        body: SaveMessageStateRequest,
        _ = Depends(jwt_required),
        messages = Injected(MessagesService),
    ):
        await messages.save_state(message_id, body.enabled)
        return { 'success': True, 'id': str(message_id) }


    @app.post("/api/messages")
    async def create_message(
        body: MessageCreateRequest,
        _ = Depends(jwt_required),
        messages = Injected(MessagesService),
    ):
        return await messages.create_message(body)


    @app.put("/api/messages/{message_id}")
    async def update_message(
        message_id: PydanticObjectId,
        body: MessageUpdateRequest,
        _ = Depends(jwt_required),
        messages = Injected(MessagesService),
    ):
        return await messages.update_message(message_id, body)
