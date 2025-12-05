from typing import List, Optional
from fastapi import Body, FastAPI, Depends, HTTPException, Path, status
from pydantic import BaseModel
from app.services import Services
from app.utils.jwt_dependencies import jwt_reporter_only, jwt_required
from datetime import datetime, timezone


class GridPowerRequest(BaseModel):
    grid_power: dict

class ExtDataCreateRequest(BaseModel):
    user_id: int
    grid_state: bool
    received_at: Optional[datetime] = None


def register(app: FastAPI, services: Services):

    @app.get("/api/ext-data/list")
    def get_ext_data_list(claims=Depends(jwt_required)):
        """
        Returns list of ext-data.
        Authenticated users only.
        """
        data_list = services.database.get_ext_data()
        result = [
            {
                'id': data.id,
                "user": data.user.name if data.user else None,
                'user_id': data.user_id,
                "grid_state": data.grid_state,
                "received_at": data.received_at.isoformat() if data.received_at else None,
            }
            for data in data_list
        ]
        return result

    @app.post("/api/ext-data/grid-power")
    def update_grid_power(
        body: GridPowerRequest,
        claims=Depends(jwt_reporter_only),  # Only reporter users
    ):
        grid_power = body.grid_power
        grid_state = grid_power.get("state", False)
        user = claims["sub"]

        try:
            data_id = services.database.update_ext_data_grid_state(
                user=user,
                grid_state=grid_state
            )
            if data_id is None:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update data state"
                )

            services.database.save_changes()
            services.events.broadcast_public("ext_data_updated")

            return {"status": "ok"}

        except Exception as e:
            services.db.session.rollback()
            print(f"Error updating grid power: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    @app.post("/api/ext-data/create", status_code=status.HTTP_201_CREATED)
    def create_ext_data(
        body: ExtDataCreateRequest = Body(...),
        claims=Depends(jwt_required),
    ):
        try:
            data_id = services.database.create_ext_data_manual(
                user_id=body.user_id,
                grid_state=body.grid_state,
                received_at=body.received_at,
            )

            if data_id is None:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create ext_data",
                )

            services.database.save_changes()
            services.events.broadcast_public("ext_data_updated")

            return {"status": "ok", "id": data_id}

        except Exception as e:
            services.database.rollback()
            print(f"Error creating ext data: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error",
            )

    @app.delete("/api/ext-data/delete/{data_id}")
    def delete_ext_data(
        data_id: int = Path(...),
        claims=Depends(jwt_required),
    ):
        try:
            success = services.database.delete_ext_data_by_id(data_id)

            if not success:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Ext_data not found or failed to delete",
                )

            services.database.save_changes()
            services.events.broadcast_public("ext_data_updated")

            return {"status": "ok"}

        except Exception as e:
            services.database.rollback()
            print(f"Error deleting ext data: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error",
            )

    @app.get("/api/ext-data/{data_id}")
    def get_ext_data_by_id(
        data_id: int = Path(...),
        claims=Depends(jwt_required),
    ):
        try:
            data = services.database.get_ext_data_by_id(data_id)

            if not data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Ext_data not found",
                )

            result = {
                "id": data.id,
                "user": data.user.name if data.user else None,
                "user_id": data.user_id,
                "grid_state": data.grid_state,
                "received_at": data.received_at.isoformat() if data.received_at else None,
            }

            return result

        except Exception as e:
            print(f"Error getting ext data by id: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error",
            )
