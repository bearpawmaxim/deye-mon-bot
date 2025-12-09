from fastapi import FastAPI, Request
from app.services import Services


def register(app: FastAPI, services: Services):

    @app.get("/api/tg/callback/{bot_id}")
    async def tg_callback_get(bot_id: int):
        return {"ok": True}


    @app.post("/api/tg/callback/{bot_id}")
    async def tg_callback_post(bot_id: int, request: Request):
        try:
            data = await request.json()
            services.bot.update(bot_id, data)
        except Exception as e:
            print(f"Error processing request: {e}")
        finally:
            return {"ok": True}
