from sqlalchemy import Boolean, Column, DateTime, Integer, String
from datetime import datetime, timezone
from .base import Base


class ExtData(Base):
    __tablename__ = 'ext_data'
    id          = Column(Integer, primary_key=True, autoincrement=True)
    user        = Column(String(256), nullable=False)
    grid_state  = Column(Boolean, default=False)
    received_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def __str__(self):
        return (f"ExtData(id={self.id}, user='{self.user}', alias='{self.alias}', "
                f"grid_state={self.grid_state}, received_at={self.received_at})")

    def to_dict(self):
        return {
            'user': self.user,
            'alias': self.alias,
            'grid_state': self.grid_state,
            'received_at': self.received_at.isoformat() if self.received_at else None
        }

