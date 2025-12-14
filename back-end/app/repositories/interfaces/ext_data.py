from abc import ABC, abstractmethod
from datetime import datetime
from typing import List
from beanie import PydanticObjectId

from shared.models.beanie.ext_data import ExtData


class IExtDataRepository(ABC):
    
    @abstractmethod
    async def get_ext_data(self) -> List[ExtData]:
        ...

    @abstractmethod
    async def get_ext_data_by_id(self, ext_data_id: PydanticObjectId) -> ExtData:
        ...

    @abstractmethod
    async def get_last_ext_data_by_user_id(self, user_id: PydanticObjectId) -> ExtData:
        ...

    @abstractmethod
    async def add_ext_data(
        self,
        user_id: PydanticObjectId,
        grid_state: bool,
        date: datetime,
    ) -> PydanticObjectId:
        ...

    @abstractmethod
    async def delete(self, ext_data_id: PydanticObjectId) -> bool:
        ...

    @abstractmethod
    async def get_ext_data_statistics(
        self,
        user_id: PydanticObjectId,
        start_date: datetime,
        end_date: datetime,
    ):
        ...

    @abstractmethod
    async def get_last_ext_data_before_date(self, user_id: int, before_date: datetime):
        ...

    @abstractmethod
    async def delete_old_data(self, keep_days: int):
        ...
