from fastapi import FastAPI, HTTPException, Path
from app.services import Services

def register(app: FastAPI, services: Services):
    @app.get("/api/outagesSchedule/outagesSchedule/{queue}")
    def get_outages_schedule(queue: str = Path(..., description="Queue name")):
        sched = services.outages_schedule.get_schedule(queue)
        if sched is None:
            raise HTTPException(status_code=404, detail=f"No schedule found for queue {queue}")
        return sched.model_dump()
