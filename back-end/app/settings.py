from datetime import timedelta
from functools import lru_cache
import os

from pydantic import Field, RedisDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict
from shared.utils import generate_secret_key


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # -------------------------
    # Core
    # -------------------------

    SECRET_KEY: str = Field(default_factory=lambda: generate_secret_key(32))
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False

    # SQLite path
    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        basedir = os.path.abspath(os.path.dirname(__file__))
        sqlite_path = os.path.abspath(os.path.join(basedir, "../", "db.sqlite3"))
        return f"sqlite:///{sqlite_path}"

    # -------------------------
    # Deye
    # -------------------------
    DEYE_BASE_URL: str | None = None
    DEYE_APP_ID: str | None = None
    DEYE_APP_SECRET: str | None = None
    DEYE_EMAIL: str | None = None
    DEYE_PASSWORD: str | None = None

    DEYE_FETCH_INTERVAL: int = Field(default=120)
    DEYE_SYNC_STATIONS_ON_POLL: bool = Field(default=False)

    # -------------------------
    # Telegram
    # -------------------------
    TG_BOT_TOKEN: str | None = None
    TG_HOOK_BASE_URL: str | None = None

    BOT_TIMEZONE: str = "utc"

    # -------------------------
    # JWT
    # -------------------------
    JWT_SECRET_KEY: str = Field(default_factory=lambda: generate_secret_key(64))
    JWT_ACCESS_TOKEN_EXPIRES_DEF: int = Field(default=60)
    JWT_REFRESH_TOKEN_EXPIRES_DEF: int = Field(default=60 * 24 * 7)

    @computed_field
    @property
    def JWT_ACCESS_TOKEN_EXPIRES(self) -> timedelta:
        return timedelta(minutes=self.JWT_ACCESS_TOKEN_EXPIRES_DEF)

    @computed_field
    @property
    def JWT_REFRESH_TOKEN_EXPIRES(self) -> timedelta:
        return timedelta(minutes=self.JWT_REFRESH_TOKEN_EXPIRES_DEF)

    # -------------------------
    # Auth / Admin
    # -------------------------
    ADMIN_USER: str | None = None
    ADMIN_PASSWORD: str | None = None

    # -------------------------
    # Redis
    # -------------------------
    REDIS_URL: RedisDsn | None = Field(default=None)

    # -------------------------
    # Other
    # -------------------------
    HOST: str = "127.0.0.1"
    STATISTIC_KEEP_DAYS: int = 3
    IS_MIGRATION_RUN: bool = False
    SSE_PING_INTERVAL: int = 45


class ProductionSettings(Settings):
    DEBUG: bool = False
    SESSION_COOKIE_HTTPONLY: bool = True
    REMEMBER_COOKIE_HTTPONLY: bool = True
    REMEMBER_COOKIE_DURATION: int = 3600


class DebugSettings(Settings):
    DEBUG: bool = True
    HOST: str = Field(default_factory=lambda: os.getenv("DEBUG_HOST", "127.0.0.1"))


CONFIG_MAP = {
    "Production": ProductionSettings,
    "Debug": DebugSettings,
}


@lru_cache
def get_settings():
    debug = os.getenv("DEBUG", "False") == "True"
    mode = "Debug" if debug else "Production"
    return CONFIG_MAP[mode]()
