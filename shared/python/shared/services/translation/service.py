import json
import logging
from pathlib import Path
from typing import Dict, Any

from shared import current_language


logger = logging.getLogger(__name__)


class TranslationService:
    i18n: Dict[str, Dict[str, Any]] = {}

    def __init__(self, path: str):
        self.load_translations(Path(path))

    def load_translations(self, path: Path) -> None:
        for lang_dir in path.iterdir():
            if not lang_dir.is_dir():
                continue

            lang = lang_dir.name
            self.i18n[lang] = {}

            for file in lang_dir.glob("*.json"):
                logger.info(f"Loading translations: {lang}/{file.name}")
                namespace = file.stem
                self.i18n[lang][namespace] = json.loads(
                    file.read_text(encoding="utf-8")
                )


    @staticmethod
    def t(key: str, lang: str | None = None, **kwargs) -> str:
        language = lang or current_language.get()

        data = TranslationService.i18n.get(
            language,
            TranslationService.i18n.get("en", {})
        )

        for part in key.split("."):
            if not isinstance(data, dict):
                return key
            data = data.get(part)

        if isinstance(data, str):
            return data.format(**kwargs)

        return key


    @staticmethod
    def translate(lang: str, key: str, **kwargs) -> str:
        return TranslationService.t(lang, key, **kwargs)
