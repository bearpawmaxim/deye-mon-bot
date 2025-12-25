from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from shared import current_language, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE


class LanguageMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        header = request.headers.get("accept-language", "")
        lang = header.split(",")[0].split("-")[0]

        if lang not in SUPPORTED_LANGUAGES:
            lang = DEFAULT_LANGUAGE

        token = current_language.set(lang)
        try:
            response = await call_next(request)
        finally:
            current_language.reset(token)

        return response
