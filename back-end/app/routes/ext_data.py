from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from app.services import Services
from app.utils.jwt_dependencies import jwt_reporter_only, jwt_required


class GridPowerRequest(BaseModel):
    grid_power: dict


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
                "user": data.user.name if data.user else None,
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
