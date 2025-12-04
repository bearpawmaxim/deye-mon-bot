from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Body
from pydantic import BaseModel
from app.services import Services
from app.utils.jwt_dependencies import jwt_required
from shared.models.sqlalchemy.message import Message

class MessagePreviewRequest(BaseModel):
    name: str
    channelId: str
    messageTemplate: str
    timeoutTemplate: str
    shouldSendTemplate: Optional[str] = None
    stations: List[int]
    botId: int


class SaveMessageStateRequest(BaseModel):
    id: int
    enabled: bool = False


class SaveMessageRequest(BaseModel):
    id: Optional[int]
    name: str
    channelId: str
    messageTemplate: str
    timeoutTemplate: str
    shouldSendTemplate: Optional[bool] = None
    stations: List[int]
    botId: int
    enabled: bool


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
        except:
            print(f'Cannot get channel info for channel {channel_id}')
            return 'Invalid channel identifier'

    @app.get("/api/messages/messages")
    def get_messages(claims=Depends(jwt_required)):
        messages = services.database.get_messages(all=True)

        def process_message(message):
            bot_name = _get_bot_name(message.bot_id)
            channel_name = _get_channel_name(message.channel_id, message.bot_id)
            stations = [station.id for station in message.stations]
            return {
                'id': message.id,
                'name': message.name,
                'channelName': channel_name,
                'stations': stations,
                'botName': bot_name,
                'lastSentTime': message.last_sent_time,
                'enabled': message.enabled,
            }

        return [process_message(message) for message in messages]

    @app.post("/api/messages/getChannel")
    def get_channel(
        channelId: str = Body(...), 
        botId: str = Body(...), 
        claims=Depends(jwt_required)
    ):
        if not channelId or not botId:
            raise HTTPException(status_code=400, detail="channelId and botId should be specified")
        channel_name = _get_channel_name(channelId, botId)
        return {'success': True, 'channelName': channel_name}

    @app.get("/api/messages/message/{message_id}")
    def get_message(message_id: int, claims=Depends(jwt_required)):
        message = services.database.get_message(message_id)
        bot_name = _get_bot_name(message.bot_id)
        channel_name = _get_channel_name(message.channel_id, message.bot_id)
        stations = [station.id for station in message.stations]
        return {
            'id': message.id,
            'name': message.name,
            'channelId': message.channel_id,
            'channelName': channel_name,
            'messageTemplate': message.message_template,
            'shouldSendTemplate': message.should_send_template,
            'timeoutTemplate': message.timeout_template,
            'stations': stations,
            'botId': message.bot_id,
            'botName': bot_name,
            'lastSentTime': message.last_sent_time,
            'enabled': message.enabled,
        }

    @app.post("/api/messages/getPreview")
    def get_message_preview(body: MessagePreviewRequest, claims=Depends(jwt_required)):
        server_stations = services.database.get_stations(True)
        id_set = set(body.stations)
        stations = [s for s in server_stations if s.id in id_set]

        message = Message(
            name=body.name,
            channel_id=body.channelId,
            message_template=body.messageTemplate,
            timeout_template=body.timeoutTemplate,
            should_send_template=body.shouldSendTemplate,
            stations=stations,
            bot_id=body.botId
        )

        try:
            info = services.bot.get_message(message)
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

    @app.patch("/api/messages/saveState")
    def save_message_state(body: SaveMessageStateRequest, claims=Depends(jwt_required)):
        services.database.save_message_state(body.id, body.enabled)
        services.database.save_changes()
        services.events.broadcast_private("messages_updated")
        return {'success': True, 'id': body.id}

    @app.patch("/api/messages/save")
    def save_message(body: SaveMessageRequest, claims=Depends(jwt_required)):
        server_stations = services.database.get_stations(True)
        id_set = set(body.stations)
        stations = [s for s in server_stations if s.id in id_set]

        message = Message(
            id=body.id,
            name=body.name,
            channel_id=body.channelId,
            message_template=body.messageTemplate,
            timeout_template=body.timeoutTemplate,
            should_send_template=body.shouldSendTemplate,
            stations=stations,
            bot_id=body.botId,
            enabled=body.enabled
        )
        message_id = services.database.save_message(message)
        services.database.save_changes()
        services.events.broadcast_private("messages_updated")
        return {'success': True, 'id': message_id}
