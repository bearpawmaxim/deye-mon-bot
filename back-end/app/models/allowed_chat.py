from sqlalchemy import Column, Integer, String
from .base import Base

class AllowedChat(Base):
    __tablename__ = 'allowed_chat'

    id               = Column(Integer, primary_key=True, autoincrement=True)
    chat_id          = Column(String)