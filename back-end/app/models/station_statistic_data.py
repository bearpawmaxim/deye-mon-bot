from datetime import timezone
from .station_data import StationData

class StationStatisticData:
    previous: StationData
    current: StationData

    def __init__(self, previous: StationData, current: StationData):
        self.previous = previous
        self.current = current

    def to_dict(self, tz=timezone.utc):
        return {
            'previous': self.previous.to_dict(tz) if self.previous else None,
            'current': self.current.to_dict(tz) if self.current else None
        }
