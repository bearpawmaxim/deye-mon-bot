from datetime import datetime
from typing import List
from beanie import PydanticObjectId

from shared.models.beanie.ext_data import ExtData
from ..interfaces.ext_data import IExtDataRepository


class ExtDataRepository(IExtDataRepository):
    
    async def get_ext_data(self) -> List[ExtData]:
        return await ExtData.find().to_list()
    
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

