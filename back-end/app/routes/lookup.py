from fastapi import FastAPI, Depends
from fastapi_injector import Injected
from app.services import Services, LookupsService
from app.utils.jwt_dependencies import jwt_required


def register(app: FastAPI, services: Services):

    @app.get("/api/lookup/{lookup_name}")
    async def get_lookup_values(
        lookup_name: str,
        _ = Depends(jwt_required),
        lookups = Injected(LookupsService),
    ):
        return await lookups.get_lookup_values(lookup_name)
