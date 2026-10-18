from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Date
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="USER", nullable=False)  # "USER" or "ADMIN"
    is_active = Column(Boolean, default=True, nullable=False)
    avatar_url = Column(String(500), nullable=True)

    # Sustainability Metrics
    sustainability_score = Column(Integer, default=0, nullable=False)
    eco_tier = Column(String(50), default="Seedling", nullable=False)
    current_streak = Column(Integer, default=0, nullable=False)
    last_scan_date = Column(Date, nullable=True)
    total_scans_count = Column(Integer, default=0, nullable=False)
    total_recycled_count = Column(Integer, default=0, nullable=False)
    diverted_weight_kg = Column(Float, default=0.0, nullable=False)
    carbon_saved_kg = Column(Float, default=0.0, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    scans = relationship("WasteScan", back_populates="user", cascade="all, delete-orphan", order_by="desc(WasteScan.created_at)")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan", order_by="desc(Notification.created_at)")
