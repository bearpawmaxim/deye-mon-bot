import logging
from typing import List
from injector import inject

from shared.models.user import User
from shared.services.events.service import EventsService
from app.repositories import IUsersRepository
from app.settings import Settings
from shared.utils.key_generation import generate_api_token, generate_password_reset_token
from shared.utils.jwt_utils import create_access_token
from ..base import BaseService


logger = logging.getLogger(__name__)


@inject
class UsersService(BaseService):
    def __init__(
        self,
        settings: Settings,
        events: EventsService,
        users_repository: IUsersRepository,
    ):
        super().__init__(events)
        self._settings = settings
        self._users_repository = users_repository

    async def get_user(self, user_name: str) -> User:
        return await self._users_repository.get_user(user_name)

    async def get_users(self, all: bool) -> List[User]:
        return await self._users_repository.get_users(all)

    async def save_user(self, id: str, name: str, is_active: bool, is_reporter: bool):
        try:
            user = await self._users_repository.get_user_by_id(id)

            if not user:
                """ User creation path """
                password_reset_token = None
                reset_token_expiration = None

                if not is_reporter:
                    password_reset_token, reset_token_expiration = generate_password_reset_token(3)

                user_id = await self._users_repository.create_user(
                    name, is_active, is_reporter, password_reset_token, reset_token_expiration
                )

                return str(user_id), password_reset_token

            """ User edition path """
            await self._users_repository.update_user(
                id          = id,
                user_name   = name,
                is_active   = is_active,
                is_reporter = is_reporter,
            )
            return str(user.id), None
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return None, None

    async def delete_user(self, user_id: str):
        try:
            return await self._users_repository.delete_user(user_id)
        except Exception as e:
            logger.error(f"Error deleting user: {e}")
            return False

    async def create_reporter_token(self, user_id: str) -> str:
        user = await self._users_repository.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        token = None
        if user.is_reporter:
            token = create_access_token(
                identity          = user.name,
                expires           = None,
                secret_key        = self._settings.JWT_SECRET_KEY,
                additional_claims = {
                    "is_reporter": True
                }
            )
        else:
            token = generate_api_token()
        await self._users_repository.save_user_api_key(user_id, token)
        return token

    async def delete_reporter_token(self, user_id: str):
        user = await self._users_repository.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        return await self._users_repository.save_user_api_key(user_id, None)
