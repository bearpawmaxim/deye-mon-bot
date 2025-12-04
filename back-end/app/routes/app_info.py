import httpx
from fastapi import APIRouter, HTTPException

FIRESTORE_URL = 'https://firestore.googleapis.com/v1/projects/svitlo-power/databases/(default)/documents/sites/app'

def register(app, services):
    @app.get("/api/app/info")
    async def get_app_info():
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(FIRESTORE_URL)
                response.raise_for_status()

            data = response.json()
            fields = data.get("fields", {})

            update_url = fields.get("updateUrl", {}).get("stringValue", "")
            version = fields.get("ver", {}).get("stringValue", "")

            return {
                "updateUrl": update_url,
                "version": version
            }

        except httpx.RequestError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch app information: {e}"
            )

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Internal server error: {e}"
            )
