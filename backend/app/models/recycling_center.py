from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text
from app.database import Base


class RecyclingCenter(Base):
    __tablename__ = "recycling_centers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    address = Column(String(255), nullable=False)
    city = Column(String(100), index=True, nullable=False)
    state = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)

    # Geo coordinates
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # Contact & Facilities
    phone = Column(String(50), nullable=True)
    website = Column(String(255), nullable=True)
    operating_hours = Column(String(255), default="Mon-Sat: 09:00 - 18:00", nullable=False)
    accepted_materials = Column(Text, nullable=False)  # JSON-encoded array of strings
    is_municipal = Column(Boolean, default=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    rating = Column(Float, default=4.5, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
