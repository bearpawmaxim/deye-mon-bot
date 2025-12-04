from fastapi import FastAPI, Request, Query
from app.services import Services


def register(app: FastAPI, services: Services):

    @app.post("/api/visit/add")
    async def visit(
        visit_type: str | None = Query(None, alias="type"),
        visit_date: str | None = Query(None, alias="date")
    ):
        services.visit_counter.add_visit(visit_type, visit_date)
        services.database.save_changes()
        return {"success": True}

    @app.get("/api/visit/stats")
    async def stats():
        return services.visit_counter.get_today_stats()
