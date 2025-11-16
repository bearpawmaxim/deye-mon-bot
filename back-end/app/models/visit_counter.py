from sqlalchemy import Boolean, Column, DateTime, Integer, String
from .base import Base

class VisitCounterBase(Base):
    __abstract__  = True

    id            = Column(Integer, primary_key=True, autoincrement=True)
    count         = Column(Integer, default=0, nullable=False)


class VisitCounter(VisitCounterBase):
    __tablename__ = 'visit_counter'


class DailyVisitCounter(VisitCounterBase):
    __tablename__ = 'daily_visit_counter'

    date          = Column(DateTime, nullable=False)
