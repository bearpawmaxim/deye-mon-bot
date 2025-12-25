from pydantic import RootModel, field_validator

from shared.language import SUPPORTED_LANGUAGES


class LocalizableValue(RootModel[dict[str, str]]):

    @field_validator("root")
    @classmethod
    def validate_keys(cls, v: dict[str, str]):
        for key in v:
            if key not in SUPPORTED_LANGUAGES:
                raise ValueError(f"Invalid culture code: {key}")
        return v

