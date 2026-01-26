import json
import logging
from pathlib import Path
from typing import Any

from aiohttp import ClientSession

from .config import ClientConfig
from .settings import Settings


async def send_ext_data(
    session: ClientSession,
    client: ClientConfig,
    settings: Settings,
    payload: dict[str, Any],
) -> bool:
    url = client.ext_data_url or settings.ext_data_url
    if not url:
        logging.warning("EXT_DATA_URL missing; skipping client %s", client.client_id)
        return False

    headers = {"Content-Type": "application/json"}
    token = client.ext_data_token or settings.ext_data_token
    if token:
        headers["Authorization"] = token if token.lower().startswith("bearer ") else f"Bearer {token}"

    try:
        async with session.post(url, json=payload, headers=headers) as resp:
            if resp.status >= 400:
                body = await resp.text()
                logging.warning("EXT_DATA error (%s): %s", resp.status, body)
                return False
            return True
    except Exception:
        logging.exception("EXT_DATA request failed for %s", client.client_id)
        return False


def load_clients(path: Path, settings: Settings) -> list[ClientConfig]:
    if path.is_dir():
        files = sorted(path.glob("*.json"))
    else:
        files = [path]

    clients: list[ClientConfig] = []
    defaults = {
        "deye_base_url": settings.deye_base_url,
    }

    for file_path in files:
        if not file_path.exists():
            logging.warning("Clients file missing: %s", file_path)
            continue
        try:
            raw = json.loads(file_path.read_text(encoding="utf-8"))
        except Exception:
            logging.exception("Failed to read clients file: %s", file_path)
            continue

        if isinstance(raw, dict) and "clients" in raw:
            items = raw["clients"]
        elif isinstance(raw, list):
            items = raw
        else:
            items = [raw]

        for item in items:
            try:
                client = ClientConfig.from_dict(item, defaults)
                logging.info("Loaded client config: %s", client.client_id)
                clients.append(client)
            except Exception:
                logging.exception("Invalid client config in %s", file_path)
    return clients
