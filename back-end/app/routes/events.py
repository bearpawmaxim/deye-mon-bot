import json
from fastapi import FastAPI, Depends
from starlette.responses import StreamingResponse

from app.utils.jwt_dependencies import get_jwt_from_query
from app.services import Services
from shared import BoundedQueue


def register(app: FastAPI, services: Services):
    @app.get("/api/events")
    async def events(
        claims: dict | None = Depends(get_jwt_from_query),
    ):
        q = BoundedQueue(maxsize=100)

        user = claims["sub"] if claims else None
        is_auth = user is not None

        services.events.add_public_client(q)
        if is_auth:
            services.events.add_private_client(q)

        async def event_generator():
            try:
                while True:
                    event = await q.async_get()
                    if event is None:
                        break

                    if event.private and not is_auth:
                        break

                    if user:
                        event.user = user

                    yield f"data: {json.dumps(event.to_dict())}\n\n"

            finally:
                services.events.remove_client(q)

        return StreamingResponse(event_generator(), media_type="text/event-stream")
