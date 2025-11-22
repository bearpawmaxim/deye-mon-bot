from typing import Dict, List
from datetime import datetime
from pydantic import BaseModel, RootModel, model_validator
from enum import Enum


class SlotType(str, Enum):
    Definite = "Definite"
    NotPlanned = "NotPlanned"


class DayStatus(str, Enum):
    ScheduleApplies = "ScheduleApplies"
    EmergencyShutdowns = "EmergencyShutdowns"
    WaitingForSchedule = "WaitingForSchedule"


class Slot(BaseModel):
    start: int
    end: int
    type: SlotType


class DaySchedule(BaseModel):
    slots: List[Slot]
    date: datetime
    status: DayStatus


class UnitSchedule(BaseModel):
    today: DaySchedule
    tomorrow: DaySchedule
    updatedOn: datetime


def keep_only_definite_slots(schedule: "SchedulesResponse") -> "SchedulesResponse":
    for unit in schedule.root.values():
        unit.today.slots = [s for s in unit.today.slots if s.type == SlotType.Definite]
        unit.tomorrow.slots = [s for s in unit.tomorrow.slots if s.type == SlotType.Definite]
    return schedule


class SchedulesResponse(RootModel[Dict[str, UnitSchedule]]):
    pass

    @model_validator(mode="after")
    def clean_slots(cls, model):
        return keep_only_definite_slots(model)
