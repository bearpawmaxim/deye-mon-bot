import logging
from datetime import datetime, timedelta, timezone
from typing import List, Literal
from beanie import PydanticObjectId
from pymongo import ASCENDING, DESCENDING

from .base import BaseReadRepository
from shared.models.ext_data import ExtData
from app.models.sorting_config import SortingConfig
from ..interfaces import DataQuery
from ..interfaces.ext_data import IExtDataRepository


logger = logging.getLogger(__name__)


class ExtDataRepository(IExtDataRepository, BaseReadRepository[ExtData]):
    model = ExtData

    def build_reference_joins(self, sorting: SortingConfig | None) -> list[dict]:
        if sorting and sorting.column == "user_id":
            return [
                {
                    "$lookup": {
                        "from": "users",
                        "localField": "user_id",
                        "foreignField": "_id",
                        "as": "user",
                    }
                },
                {"$unwind": "$user"},
            ]
        return []


    def build_sort_stage(self, sorting: SortingConfig | None) -> dict:
        if not sorting:
            return {}

        if sorting.column == "user_id":
            sort_field = "user.name"
        else:
            return super().build_sort_stage(sorting)

        direction = ASCENDING if sorting.order == "asc" else DESCENDING
        return {sort_field: direction}


    async def get_ext_data(self, query: DataQuery = None) -> tuple[List[ExtData], int]:
        return await self.get_data(query)

    async def get_ext_data_by_id(self, ext_data_id: PydanticObjectId) -> ExtData:
        return await ExtData.get(ext_data_id)

    async def get_last_ext_data_by_user_id(self, user_id: PydanticObjectId) -> ExtData:
        documents = await ExtData.find(
            ExtData.user_id == user_id,
            fetch_links = True
        ).sort(
            -ExtData.received_at
        ).to_list()
        return documents[0] if documents else None

    async def add_ext_data(
        self,
        user_id: PydanticObjectId,
        grid_state: bool,
        date: datetime,
    ) -> PydanticObjectId:
        ext_data = ExtData(
            user_id     = user_id,
            grid_state  = grid_state,
            received_at = date,
        )
        await ext_data.insert()
        return ext_data.id

    async def delete(self, ext_data_id: PydanticObjectId) -> bool:
        ext_data = await ExtData.get(ext_data_id)
        if ext_data:
            await ext_data.delete()
            return True
        return False

    async def get_ext_data_statistics(
        self,
        user_id: PydanticObjectId,
        start_date: datetime,
        end_date: datetime,
    ):
        ext_data = await ExtData.find(
            ExtData.user_id == user_id,
            ExtData.received_at >= start_date,
            ExtData.received_at <= end_date
        ).sort(
            ExtData.received_at
        ).to_list()

        return ext_data

    async def get_last_ext_data_before_date(self, user_id: int, before_date: datetime):
        try:
            docs = await ExtData.find(
                ExtData.user_id == user_id,
                ExtData.received_at < before_date
            ).sort(
                -ExtData.received_at
            ).limit(1).to_list()
            return docs[0] if docs else None
        except Exception as e:
            logger.error(f'Error getting last ext data before date: {e}')
            return None

    async def delete_old_data(self, keep_days: int):
        timeout = datetime.now(timezone.utc) - timedelta(days = keep_days)
        logger.info(f"removing ext data older than {timeout}")

        await ExtData.find(
            ExtData.received_at < timeout
        ).delete()
