from beanie import PydanticObjectId
from fastapi import FastAPI, Request
from fastapi_injector import Injected
from app.services import MessageProcessorService


def register(app: FastAPI):

    @app.get("/api/tg/callback/{bot_id}")
    async def tg_callback_get(bot_id: PydanticObjectId):
        return {"ok": True}


    @app.post("/api/tg/callback/{bot_id}")
    async def tg_callback_post(
        bot_id: PydanticObjectId,
        request: Request,
        message_processor = Injected(MessageProcessorService)
    ):
        try:
            data = await request.json()
            await message_processor.handle_incoming_message(bot_id, data)
        except Exception as e:
            print(f"Error processing request: {e}")
        finally:
            return {"ok": True}
