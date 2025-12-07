from fastapi import FastAPI, Query
from fastapi_injector import Injected
from app.services import VisitCounterService


def register(app: FastAPI):

    @app.post("/api/visit/add")
    async def visit(
        visit_type: str | None = Query(None, alias="type"),
        visit_date: str | None = Query(None, alias="date"),
        visit_counter = Injected(VisitCounterService),
    ):
        visit_counter.add_visit(visit_type, visit_date)
        return { "success": True }

    @app.get("/api/visit/stats")
    async def stats(visit_counter = Injected(VisitCounterService)):
        return visit_counter.get_today_stats()
