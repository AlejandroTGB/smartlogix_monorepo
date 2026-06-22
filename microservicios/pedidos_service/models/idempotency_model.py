from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from database import Base

class IdempotencyKeyDB(Base):
    __tablename__ = "idempotency_keys"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))