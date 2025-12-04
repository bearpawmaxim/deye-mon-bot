from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from app.services import Services
from app.utils.jwt_dependencies import jwt_required


class IdRequest(BaseModel):
    id: int


def register(app: FastAPI, services: Services):

    def _get_bot_name(bot_id: str):
        try:
            return services.telegram.get_bot_info(bot_id).username
        except:
            print(f"Cannot get bot info for bot {bot_id}")
            return "Invalid bot identifier"

    def _get_chat_name(chat_id: str, bot_id: str):
        try:
            chat_info = services.telegram.get_chat_info(chat_id, bot_id)
            return chat_info.username if chat_info.username is not None else chat_info.title
        except:
            print(f"Cannot get chat info for chat {chat_id}")
            return "Invalid chat identifier"

    @app.post("/api/chats/allowedChats")
    def get_chats(claims=Depends(jwt_required)):
        chats = services.database.get_allowed_chats()

        def process_chat(chat):
            chat_name = _get_chat_name(chat.chat_id, chat.bot_id)
            bot_name = _get_bot_name(chat.bot_id)
            return {
                "id": chat.id,
                "chatId": chat.chat_id,
                "chatName": chat_name,
                "botId": chat.bot_id,
                "botName": bot_name,
                "approveDate": chat.approve_date,
            }

        futures = [services.executor.submit(process_chat, chat) for chat in chats]
        return [f.result() for f in futures]

    @app.post("/api/chats/chatRequests")
    def get_chat_requests(claims=Depends(jwt_required)):
        chats = services.database.get_chat_requests()

        def process_chat(chat):
            chat_name = _get_chat_name(chat.chat_id, chat.bot_id)
            bot_name = _get_bot_name(chat.bot_id)
            return {
                "id": chat.id,
                "chatId": chat.chat_id,
                "chatName": chat_name,
                "botId": chat.bot_id,
                "botName": bot_name,
                "requestDate": chat.request_date,
            }

        futures = [services.executor.submit(process_chat, chat) for chat in chats]
        return [f.result() for f in futures]

    @app.patch("/api/chats/approve")
    def approve_chat_request(body: IdRequest, claims=Depends(jwt_required)):
        services.database.approve_chat_request(body.id)
        services.database.save_changes()
        services.events.broadcast_private("chats_updated")
        return {"ok": True}

    @app.patch("/api/chats/reject")
    def reject_chat_request(body: IdRequest, claims=Depends(jwt_required)):
        services.database.reject_chat_request(body.id)
        services.database.save_changes()
        services.events.broadcast_private("chats_updated")
        return {"ok": True}

    @app.patch("/api/chats/disallow")
    def disallow_chat(body: IdRequest, claims=Depends(jwt_required)):
        services.database.disallow_chat(body.id)
        services.database.save_changes()
        services.events.broadcast_private("chats_updated")
        return {"ok": True}
