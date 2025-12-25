from contextvars import ContextVar

SUPPORTED_LANGUAGES = {"en", "uk"}
DEFAULT_LANGUAGE = "en"

current_language: ContextVar[str] = ContextVar(
    "current_language",
    default="en"
)
