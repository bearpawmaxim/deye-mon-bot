from typing import List

from beanie import PydanticObjectId

from shared.models.beanie.building import Building
from shared.models.beanie.dashboard_config import DashboardConfig
from ..interfaces.dashboard import IDashboardRepository

class DashboardRepository(IDashboardRepository):
    
    async def get_buildings(self, ids: List[PydanticObjectId] = None) -> List[Building]:
        if ids is not None:
            return await Building.find(Building.id.in_(ids), fetch_links=True).to_list()
        return await Building.find(fetch_links=True).to_list()

    async def get_config(self) -> DashboardConfig:
        return await DashboardConfig.find_one()

    async def save_config(self, config: DashboardConfig):
        existing_config = await DashboardConfig.find_one()
        if existing_config:
            existing_config.title = config.title
            existing_config.enable_outages_schedule = config.enable_outages_schedule
            existing_config.outages_schedule_queue = config.outages_schedule_queue
            await existing_config.save()
        else:
            await config.insert()