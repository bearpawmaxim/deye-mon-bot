from sqlalchemy import Column, Integer, String
from .base import Base

class DashboardConfig(Base):
    __tablename__ = 'dashboard_config'

    id    = Column(Integer, primary_key=True, autoincrement=True)
    key   = Column(String(64))
    value = Column(String(1024))
