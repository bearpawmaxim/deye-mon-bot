from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base

class Bot(Base):
    __tablename__ = 'bot'
    id        = Column(Integer, primary_key=True, autoincrement=True)
    bot_token = Column(String(256))
    enabled   = Column(Boolean, default=True)
