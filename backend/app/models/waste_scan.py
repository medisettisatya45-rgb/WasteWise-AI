from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class WasteScan(Base):
    __tablename__ = "waste_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    image_path = Column(String(500), nullable=False)
    image_filename = Column(String(255), nullable=False)

    # Classification
    category = Column(String(100), index=True, nullable=False)
    subcategory = Column(String(100), nullable=True)
    confidence = Column(Float, nullable=False)
    is_recyclable = Column(Boolean, default=True, nullable=False)
    material_composition = Column(String(255), nullable=True)

    # Guidance
    disposal_instructions = Column(Text, nullable=False)
    preparation_steps = Column(Text, nullable=True)
    target_bin_color = Column(String(100), nullable=False)

    # Environmental Impact
    estimated_carbon_saved_kg = Column(Float, default=0.0, nullable=False)
    estimated_weight_kg = Column(Float, default=0.1, nullable=False)

    # Audit & Tracking
    user_feedback_correct = Column(Boolean, nullable=True)
    model_version = Column(String(100), default="WasteWise-Net-v1.0", nullable=False)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True, nullable=False)

    # Relationship
    user = relationship("User", back_populates="scans")
