from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .base import Base


class ExtData(Base):
    __tablename__ = 'ext_data'
    id          = Column(Integer, primary_key=True, autoincrement=True)
    user_id     = Column(Integer, ForeignKey('users.id'), nullable=False)
    grid_state  = Column(Boolean, default=False)
    received_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user        = relationship("User")

    def __str__(self):
        return (f"ExtData(id={self.id}, user_id={self.user_id}, "
                f"grid_state={self.grid_state}, received_at={self.received_at})")

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'grid_state': self.grid_state,
            'received_at': self.received_at.isoformat() if self.received_at else None
        }