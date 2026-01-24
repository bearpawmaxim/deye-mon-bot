import asyncio
import json
import logging
import os
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import aiohttp
from aiohttp import ClientSession, ClientTimeout
from dotenv import load_dotenv

DEFAULT_POLL_INTERVAL = 240
DEFAULT_TIMEOUT = 20
GRID_POWER_THRESHOLD = 0.1



@dataclass(frozen=True)
class DeyeCredentials:
    base_url: str
    app_id: str
    app_secret: str
    email: str
    password: str


@dataclass(frozen=True)
class ClientConfig:
    client_id: str
    station_id: int
    deye: DeyeCredentials
    poll_interval: int | None = None
    ext_data_url: str | None = None
    ext_data_token: str | None = None

    @staticmethod
    def from_dict(data: dict[str, Any], defaults: dict[str, Any]) -> "ClientConfig":
        deye = data.get("deye", data)
        poll_interval = data.get("poll_interval")
        if poll_interval is not None:
            poll_interval = int(poll_interval)
        client = ClientConfig(
            client_id=str(data["client_id"]),
            station_id=int(data["station_id"]),
            deye=DeyeCredentials(
                base_url=str(
                    deye.get("base_url")
                    or defaults["deye_base_url"]
                    or ""
                ),
                app_id=str(deye.get("app_id") or ""),
                app_secret=str(deye.get("app_secret") or ""),
                email=str(deye.get("email") or ""),
                password=str(deye.get("password") or ""),
            ),
            poll_interval=poll_interval,
            ext_data_url=data.get("ext_data_url"),
            ext_data_token=data.get("ext_data_token"),
        )
        if not all(
            [
                client.deye.base_url,
                client.deye.app_id,
                client.deye.app_secret,
                client.deye.email,
                client.deye.password,
            ]
        ):
            raise ValueError("Missing DEYE credentials")
        return client


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


class DeyeClient:
    def __init__(self, session: ClientSession, creds: DeyeCredentials) -> None:
        self._session = session
        self._creds = creds
        self._token: str | None = None

    async def _get_token(self) -> str | None:
        url = f"{self._creds.base_url}/account/token?appId={self._creds.app_id}"
        password_hash = hashlib_sha256(self._creds.password)
        payload = {
            "appSecret": self._creds.app_secret,
            "email": self._creds.email,
            "companyId": "0",
            "password": password_hash,
        }
        try:
            async with self._session.post(url, json=payload) as resp:
                resp.raise_for_status()
                data = await resp.json()
                return data.get("accessToken")
        except Exception:
            logging.exception("Failed to get token for %s", self._creds.email)
            return None

    async def _refresh_token(self) -> None:
        self._token = await self._get_token()

    async def _request(self, method: str, endpoint: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        if not self._token:
            await self._refresh_token()

        url = f"{self._creds.base_url}{endpoint}"
        headers = {"Authorization": f"Bearer {self._token or ''}"}

        for attempt in range(2):
            try:
                async with self._session.request(method, url, json=payload, headers=headers) as resp:
                    if resp.status == 401 and attempt == 0:
                        await self._refresh_token()
                        headers["Authorization"] = f"Bearer {self._token or ''}"
                        continue
                    if resp.status >= 400:
                        body = await resp.text()
                        logging.warning(
                            "Deye API error %s for %s: %s",
                            resp.status,
                            endpoint,
                            body,
                        )
                        return None
                    data = await resp.json()

                if (
                    not data.get("success", True)
                    and "token" in str(data.get("msg", "")).lower()
                    and attempt == 0
                ):
                    await self._refresh_token()
                    headers["Authorization"] = f"Bearer {self._token or ''}"
                    continue
                return data
            except Exception:
                logging.exception("Deye API request failed: %s", endpoint)
                return None
        return None

    async def get_station_data(self, station_id: int) -> dict[str, Any] | None:
        return await self._request("POST", "/station/latest", {"stationId": station_id})


def hashlib_sha256(value: str) -> str:
    import hashlib

    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def normalize_number(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return round(float(value), 3)
    except Exception:
        return None


def normalize_station_data(client: ClientConfig, raw: dict[str, Any]) -> dict[str, Any]:
    payload = raw.get("data", raw) if isinstance(raw, dict) else {}
    grid_power_raw = (
        payload.get("gridPower")
        if payload.get("gridPower") is not None
        else payload.get("grid_power")
        if payload.get("grid_power") is not None
        else payload.get("purchasePower")
        if payload.get("purchasePower") is not None
        else payload.get("purchase_power")
        if payload.get("purchase_power") is not None
        else payload.get("wirePower")
        if payload.get("wirePower") is not None
        else payload.get("wire_power")
    )
    grid_power = normalize_number(grid_power_raw)
    grid_state = None if grid_power is None else abs(grid_power) > GRID_POWER_THRESHOLD
    now = datetime.now(timezone.utc).isoformat()

    return {
        "client_id": client.client_id,
        "station_id": client.station_id,
        "received_at": now,
        "status": "ok" if raw.get("success", True) else "error",
        "message": raw.get("msg"),
        "grid_state": grid_state,
        "grid_power": grid_power,
        "generation_power": normalize_number(payload.get("generationPower") or payload.get("generation_power")),
        "consumption_power": normalize_number(payload.get("consumptionPower") or payload.get("consumption_power")),
        "battery_soc": normalize_number(payload.get("batterySOC") or payload.get("battery_soc")),
        "battery_power": normalize_number(payload.get("batteryPower") or payload.get("battery_power")),
        "charge_power": normalize_number(payload.get("chargePower") or payload.get("charge_power")),
        "discharge_power": normalize_number(payload.get("dischargePower") or payload.get("discharge_power")),
        "purchase_power": normalize_number(payload.get("purchasePower") or payload.get("purchase_power")),
        "wire_power": normalize_number(payload.get("wirePower") or payload.get("wire_power")),
        "irradiate_intensity": normalize_number(
            payload.get("irradiateIntensity") or payload.get("irradiate_intensity")
        ),
        "last_update_time": normalize_number(payload.get("lastUpdateTime") or payload.get("last_update_time")),
    }


def is_grid_state_changed(prev: dict[str, Any] | None, curr: dict[str, Any]) -> bool:
    if not prev:
        return True
    return prev.get("grid_state") != curr.get("grid_state")


async def send_ext_data(
    session: ClientSession,
    client: ClientConfig,
    defaults: dict[str, Any],
    payload: dict[str, Any],
) -> bool:
    url = client.ext_data_url or defaults["ext_data_url"]
    if not url:
        logging.warning("EXT_DATA_URL missing; skipping client %s", client.client_id)
        return False

    headers = {"Content-Type": "application/json"}
    token = client.ext_data_token or defaults["ext_data_token"]
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


def load_clients(path: Path, defaults: dict[str, Any]) -> list[ClientConfig]:
    if path.is_dir():
        files = sorted(path.glob("*.json"))
    else:
        files = [path]

    clients: list[ClientConfig] = []
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
                clients.append(ClientConfig.from_dict(item, defaults))
            except Exception:
                logging.exception("Invalid client config in %s", file_path)
    return clients


async def client_loop(
    client: ClientConfig,
    deye_client: DeyeClient,
    ext_session: ClientSession,
    state_store: StateStore,
    defaults: dict[str, Any],
) -> None:
    interval = client.poll_interval or defaults["poll_interval"]
    while True:
        try:
            prev_state = state_store.load(client.client_id)
            raw = await deye_client.get_station_data(client.station_id)
            logging.info("DEYE raw for %s: %s", client.client_id, raw)
            if not raw or not raw.get("success", True):
                logging.warning("Deye data unavailable for %s", client.client_id)
                await asyncio.sleep(interval)
                continue

            current_state = normalize_station_data(client, raw)
            grid_state = current_state.get("grid_state")
            if grid_state is None:
                logging.warning("Grid state missing for %s", client.client_id)
                await asyncio.sleep(interval)
                continue
            if not is_grid_state_changed(prev_state, current_state):
                logging.info("Grid state unchanged for %s", client.client_id)
                await asyncio.sleep(interval)
                continue

            logging.info(
                "Grid state changed for %s: %s",
                client.client_id,
                "ON" if grid_state else "OFF",
            )

            payload = {"grid_power": {"state": bool(grid_state)}}
            sent = await send_ext_data(ext_session, client, defaults, payload)
            if sent:
                state_store.save(client.client_id, current_state)
        except Exception:
            logging.exception("Client loop failed: %s", client.client_id)
        await asyncio.sleep(interval)


async def run() -> None:
    load_dotenv()
    logging.basicConfig(
        level=os.getenv("LOG_LEVEL", "INFO").upper(),
        format="%(asctime)s %(levelname)s %(message)s",
    )

    defaults = {
        "poll_interval": int(os.getenv("POLL_INTERVAL", str(DEFAULT_POLL_INTERVAL))),
        "deye_base_url": os.getenv("DEYE_BASE_URL"),
        "ext_data_url": os.getenv("EXT_DATA_URL"),
        "ext_data_token": os.getenv("EXT_DATA_TOKEN"),
        "state_path": os.getenv("STATE_PATH", "state.json"),
        "clients_path": os.getenv("CLIENTS_PATH", "clients.json"),
        "timeout": int(os.getenv("HTTP_TIMEOUT", str(DEFAULT_TIMEOUT))),
    }

    clients_path = Path(defaults["clients_path"])
    state_path = Path(defaults["state_path"])
    clients = load_clients(clients_path, defaults)
    if not clients:
        logging.error("No clients loaded; exiting")
        return

    timeout = ClientTimeout(total=defaults["timeout"])
    async with aiohttp.ClientSession(timeout=timeout) as session:
        state_store = StateStore(state_path)
        tasks = []
        for client in clients:
            deye_client = DeyeClient(session, client.deye)
            tasks.append(
                asyncio.create_task(
                    client_loop(client, deye_client, session, state_store, defaults)
                )
            )
        await asyncio.gather(*tasks)


if __name__ == "__main__":
    asyncio.run(run())
