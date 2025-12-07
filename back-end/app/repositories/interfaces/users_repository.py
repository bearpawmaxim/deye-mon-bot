from abc import ABC, abstractmethod
from datetime import datetime
from typing import List

from shared.models.beanie.user import User


class IUsersRepository(ABC):
    
    @abstractmethod
    async def get_user(self, user_name: str) -> User:
        ...

    @abstractmethod
    async def get_users(self, all: bool) -> List[User]:
        ...

    @abstractmethod
    async def get_user_by_id(self, user_id: str) -> User:
        ...

    @abstractmethod
    async def get_user_by_reset_token(self, token: str) -> User:
        ...

    @abstractmethod
    async def rename_user(self, user_id: str, user_name: str):
        ...

    @abstractmethod
    async def set_password_reset_token(
        self,
        user_id: str,
        reset_token: str,
        reset_token_expiration: datetime,
    ):
        ...

    @abstractmethod
    async def remove_password_reset_token(
        self,
        user_id: str,
    ):
        ...

    @abstractmethod
    async def change_password(self, user_id: str, new_password: str):
        ...

    @abstractmethod
    async def create_user(
        self,
        id: str,
        user_name: str,
        is_active: bool,
        is_reporter: bool,
        password_reset_token: str,
        reset_token_expiration: str,
    ) -> str:
        ...

    @abstractmethod
    async def update_user(
        self,
        id: str,
        user_name: str,
        is_active: bool,
        is_reporter: bool,
    ) -> str:
        ...

    @abstractmethod
    async def delete_user(self, user_id: str) -> bool:
        ...

    @abstractmethod
    async def save_user_api_key(self, user_id: str, api_key: str) -> bool:
        ...