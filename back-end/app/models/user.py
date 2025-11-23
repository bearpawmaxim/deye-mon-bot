from sqlalchemy import Boolean, Column, DateTime, Integer, String
from .base import Base


class User(Base):
    __tablename__        = 'users'
    id                   = Column(Integer, primary_key=True, autoincrement=True)
    name                 = Column(String(64), unique=True)
    password             = Column(String(128))
    is_active            = Column(Boolean, default=True, server_default='1')
    is_reporter          = Column(Boolean, default=False, server_default='0')
    api_key              = Column(String(64), nullable=True)
    password_reset_token = Column(String(64), nullable=True)
    reset_token_expiration = Column(DateTime, nullable=True)

    def __str__(self):
        return (f"User(id={self.id}, name='{self.name}', password='***', is_active={self.is_active}")
