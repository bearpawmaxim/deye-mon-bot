from datetime import datetime, timezone
from typing import List
from beanie import PydanticObjectId
from injector import inject

from shared.models.beanie.ext_data import ExtData
from shared.models.beanie.user import User
from ..base import BaseService
from app.models.api import ExtDataResponse
from shared.services.events.service import EventsService
from app.repositories import IExtDataRepository, IUsersRepository


@inject
class ExtDataService(BaseService):
    def __init__(
        self,
        events: EventsService,
        ext_data: IExtDataRepository,
        users: IUsersRepository,
    ):
        super().__init__(events)
        self._ext_data = ext_data
        self._users = users


    def _process_ext_data(self, ext_data: ExtData):
        return ExtDataResponse(
            id          = ext_data.id,
            grid_state  = ext_data.grid_state,
            user_id     = ext_data.user_id,
            received_at = ext_data.received_at
        )


    async def _add_ext_data(self, user: User, grid_state: bool, date: datetime) -> PydanticObjectId:
        id = await self._ext_data.add_ext_data(user.id, grid_state, date)
        self.broadcast_public("ext_data_updated")
        return id


    async def add_ext_data(self, user_name: str, grid_state: bool) -> PydanticObjectId:
        user = await self._users.get_user(user_name)

        if user is not None:
            date = datetime.now(timezone.utc)
            return await self._add_ext_data(user, grid_state, date)

        return None


    async def add_ext_data_by_user_id(self, user_id: PydanticObjectId, grid_state: bool, date: datetime = None):
        user = await self._users.get_user_by_id(user_id)

        if user is not None:
            date = date or datetime.now(timezone.utc)
            return await self._add_ext_data(user, grid_state, date)

        return None


    async def get_ext_data(self) -> List[ExtDataResponse]:
        ext_data = await self._ext_data.get_ext_data()

        return [self._process_ext_data(ext_data_item) for ext_data_item in ext_data]
    

    async def get_by_id(self, ext_data_id: PydanticObjectId) -> ExtDataResponse:
        ext_data = await self._ext_data.get_ext_data_by_id(ext_data_id)

        if ext_data is None:
            return None

        return self._process_ext_data(ext_data)


    async def delete_ext_data(self, ext_data_id: PydanticObjectId):
        if await self._ext_data.delete(ext_data_id):
            self.broadcast_public("ext_data_updated")
            return True
        return False
