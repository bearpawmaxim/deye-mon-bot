from flask_sqlalchemy import SQLAlchemy


class DatabaseConfig:
    db: SQLAlchemy
    statistic_keep_days: int

    def __init__(self, db: SQLAlchemy, statistic_keep_days: int):
        self.db = db
        self.statistic_keep_days = statistic_keep_days

    def __str__(self):
        return (f"DatabaseConfig(statistic_keep_days={self.statistic_keep_days})")
