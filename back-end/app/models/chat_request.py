from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship
from .base import Base

class ChatRequest(Base):
    __tablename__ = 'chat_request'

    id           = Column(Integer, primary_key=True, autoincrement=True)
    chat_id      = Column(String)
    bot_id       = Column(Integer, ForeignKey('bot.id'), nullable=False)
    request_date = Column(DateTime, server_default=func.now())

    bot          = relationship("Bot")