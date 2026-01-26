import json
import logging
from pathlib import Path
from typing import Any


class StateStore:
    def __init__(self, path: Path) -> None:
        self._path = path
        if self._path.suffix:
            self._path.parent.mkdir(parents=True, exist_ok=True)
        else:
            self._path.mkdir(parents=True, exist_ok=True)

    def load(self, client_id: str) -> dict[str, Any] | None:
        if self._path.is_dir():
            return self._load_file(self._path / f"{client_id}.json")
        data = self._load_file(self._path)
        if not isinstance(data, dict):
            return None
        return data.get(client_id)

    def save(self, client_id: str, state: dict[str, Any]) -> None:
        if self._path.is_dir():
            self._write_file(self._path / f"{client_id}.json", state)
            return
        data = self._load_file(self._path)
        if not isinstance(data, dict):
            data = {}
        data[client_id] = state
        self._write_file(self._path, data)

    def _load_file(self, path: Path) -> dict[str, Any] | None:
        if not path.exists():
            return None
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            logging.exception("Failed to load state file: %s", path)
            return None

    def _write_file(self, path: Path, payload: dict[str, Any]) -> None:
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(payload, ensure_ascii=True, indent=2), encoding="utf-8")
        except Exception:
            logging.exception("Failed to save state file: %s", path)
