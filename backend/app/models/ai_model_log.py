from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from app.database import Base


class AIModelLog(Base):
    __tablename__ = "ai_model_logs"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), default="WasteWise-Net", nullable=False)
    model_version = Column(String(50), default="v1.0", nullable=False)
    action = Column(String(50), nullable=False)  # "prediction", "reload", "retrain", "threshold_update"
    confidence_threshold = Column(Float, default=0.60, nullable=False)
    status = Column(String(50), default="success", nullable=False)
    details = Column(Text, nullable=True)

    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True, nullable=False)
