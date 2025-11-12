from .base import Base
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class BuildingData(Base):
    __tablename__ = 'building_data'

    id                = Column(Integer, primary_key=True, autoincrement=True)
    building_id       = Column(Integer, ForeignKey('building.id'), nullable=False)
    is_grid_available = Column(Boolean, nullable=False)
    last_update_time  = Column(DateTime, default=0)

    building          = relationship("Building")

    def to_dict(self):
        return {
            'id': self.id,
            'building_id': self.building_id,
            'is_grid_available': self.is_grid_available,
            'last_update_time': self.last_update_time
        }