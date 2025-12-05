from datetime import timedelta
from pydantic import BaseModel, Field, computed_field
from pydantic.networks import RedisDsn

from shared.utils import generate_secret_key


class BaseJWTSettings(BaseModel):
    JWT_SECRET_KEY: str = Field(
        default_factory=lambda: generate_secret_key(64),
        description="JWT signing key (auto-generated if missing)."
    )

    JWT_ACCESS_TOKEN_EXPIRES_MIN: int = Field(
        default=60,
        description="Access token expiration in minutes."
    )

    JWT_REFRESH_TOKEN_EXPIRES_MIN: int = Field(
        default=60 * 24 * 7,
        description="Refresh token expiration in minutes."
    )

    @computed_field
    @property
    def JWT_ACCESS_TOKEN_EXPIRES(self) -> timedelta:
        return timedelta(minutes=self.JWT_ACCESS_TOKEN_EXPIRES_MIN)

    @computed_field
    @property
    def JWT_REFRESH_TOKEN_EXPIRES(self) -> timedelta:
        return timedelta(minutes=self.JWT_REFRESH_TOKEN_EXPIRES_MIN)


class BaseRedisSettings(BaseModel):
    REDIS_URL: RedisDsn | None = Field(
        default=None,
        description="Redis DSN (redis:// or rediss://)."
    )
