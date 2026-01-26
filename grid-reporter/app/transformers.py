from datetime import datetime, timezone
from typing import Any

from .config import ClientConfig
from .constants import GRID_POWER_THRESHOLD


def normalize_number(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return round(float(value), 3)
    except Exception:
        return None


def normalize_station_data(client: ClientConfig, raw: dict[str, Any]) -> dict[str, Any]:
    payload = raw.get("data", raw) if isinstance(raw, dict) else {}
    grid_power_raw = _get_field_value(
        payload,
        [
            "gridPower",
            "grid_power",
            "purchasePower",
            "purchase_power",
            "wirePower",
            "wire_power",
        ],
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
        "generation_power": normalize_number(
            _get_field_value(payload, ["generationPower", "generation_power"])
        ),
        "consumption_power": normalize_number(
            _get_field_value(payload, ["consumptionPower", "consumption_power"])
        ),
        "battery_soc": normalize_number(
            _get_field_value(payload, ["batterySOC", "battery_soc"])
        ),
        "battery_power": normalize_number(
            _get_field_value(payload, ["batteryPower", "battery_power"])
        ),
        "charge_power": normalize_number(
            _get_field_value(payload, ["chargePower", "charge_power"])
        ),
        "discharge_power": normalize_number(
            _get_field_value(payload, ["dischargePower", "discharge_power"])
        ),
        "purchase_power": normalize_number(
            _get_field_value(payload, ["purchasePower", "purchase_power"])
        ),
        "wire_power": normalize_number(
            _get_field_value(payload, ["wirePower", "wire_power"])
        ),
        "irradiate_intensity": normalize_number(
            _get_field_value(payload, ["irradiateIntensity", "irradiate_intensity"])
        ),
        "last_update_time": normalize_number(
            _get_field_value(payload, ["lastUpdateTime", "last_update_time"])
        ),
    }


def is_grid_state_changed(prev: dict[str, Any] | None, curr: dict[str, Any]) -> bool:
    if not prev:
        return True
    return prev.get("grid_state") != curr.get("grid_state")


def _get_field_value(
    payload: dict[str, Any], field_names: list[str]
) -> Any:
    for field in field_names:
        value = payload.get(field)
        if value is not None:
            return value
    return None
