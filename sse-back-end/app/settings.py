from functools import lru_cache
import os

from pydantic_settings import BaseSettings, SettingsConfigDict
from shared.settings.base import BaseAppSettings, BaseJWTSettings, BaseRedisSettings


class Settings(BaseSettings, BaseAppSettings, BaseJWTSettings, BaseRedisSettings):
    model_config = SettingsConfigDict(
        env_file          = "../.env",
        env_file_encoding = "utf-8",
        case_sensitive    = False,
        extra             = "ignore"
    )


class ProductionSettings(Settings):
    DEBUG: bool = False


class DebugSettings(Settings):
    DEBUG: bool = True


CONFIG_MAP = {
    "Production": ProductionSettings,
    "Debug": DebugSettings,
}


@lru_cache
def get_settings():
    debug = os.getenv("DEBUG", "False") == "True"
    mode = "Debug" if debug else "Production"
    return CONFIG_MAP[mode]()
