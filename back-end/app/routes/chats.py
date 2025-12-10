from fastapi import FastAPI, Depends
from fastapi_injector import Injected
from app.models.api import ChatIdRequest
from app.services import ChatsService
from app.utils.jwt_dependencies import jwt_required


def register(app: FastAPI):

    @app.post("/api/chats/allowedChats")
    async def get_chats(
        _ = Depends(jwt_required),
        chats_service = Injected(ChatsService),
    ):
        return await chats_service.get_chats()

    @app.post("/api/chats/chatRequests")
    async def get_chat_requests(
        _ = Depends(jwt_required),
        chats_service = Injected(ChatsService),
    ):
        return await chats_service.get_chat_requests()

    @app.patch("/api/chats/approve")
    async def approve_chat_request(
        body: ChatIdRequest,
        _ = Depends(jwt_required),
        chats_service = Injected(ChatsService),
    ):
        await chats_service.approve_chat_request(body)
        return {"ok": True}

    @app.patch("/api/chats/reject")
    async def reject_chat_request(
        body: ChatIdRequest,
        _ = Depends(jwt_required),
        chats_service = Injected(ChatsService),
    ):
        await chats_service.reject_chat_request(body)
        return {"ok": True}

    @app.patch("/api/chats/disallow")
    async def disallow_chat(
        body: ChatIdRequest,
        _ = Depends(jwt_required),
        chats_service = Injected(ChatsService),
    ):
        await chats_service.disallow_chat(body)
        return {"ok": True}
