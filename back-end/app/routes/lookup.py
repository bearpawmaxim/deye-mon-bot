from fastapi import FastAPI, Depends, HTTPException
from app.services import Services
from app.utils.jwt_dependencies import jwt_required


def register(app: FastAPI, services: Services):

    @app.get("/api/lookup/{lookup_name}")
    def get_lookup_values(lookup_name: str, claims=Depends(jwt_required)):
        values = services.database.get_lookup_values(lookup_name)
        if values is None:
            raise HTTPException(status_code=404, detail="Lookup not found")
        return values
