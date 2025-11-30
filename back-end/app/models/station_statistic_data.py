from datetime import timezone
from shared.models.sqlalchemy import StationData

class StationStatisticData:
    _previous: StationData
    _current: StationData

    def __init__(self, previous: StationData, current: StationData):
        self._previous = previous
        self._current = current

    def to_dict(self, tz=timezone.utc):
        return {
            'previous': self._previous.to_dict(tz) if self._previous else None,
            'current': self._current.to_dict(tz) if self._current else None
        }
