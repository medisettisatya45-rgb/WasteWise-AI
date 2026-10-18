from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    notification_type: str = "tip"
    link_url: Optional[str] = None


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    link_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
