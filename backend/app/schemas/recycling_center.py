from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class RecyclingCenterBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    address: str = Field(..., min_length=5, max_length=255)
    city: str = Field(..., min_length=2, max_length=100)
    state: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: float
    longitude: float
    phone: Optional[str] = None
    website: Optional[str] = None
    operating_hours: str = "Mon-Sat: 09:00 - 18:00"
    accepted_materials: List[str]
    is_municipal: bool = True
    is_active: bool = True
    rating: float = Field(default=4.5, ge=0.0, le=5.0)


class RecyclingCenterCreate(RecyclingCenterBase):
    pass


class RecyclingCenterUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    operating_hours: Optional[str] = None
    accepted_materials: Optional[List[str]] = None
    is_municipal: Optional[bool] = None
    is_active: Optional[bool] = None
    rating: Optional[float] = None


class RecyclingCenterResponse(BaseModel):
    id: int
    name: str
    address: str
    city: str
    state: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: float
    longitude: float
    phone: Optional[str] = None
    website: Optional[str] = None
    operating_hours: str
    accepted_materials: List[str]
    is_municipal: bool
    is_active: bool
    rating: float
    distance_km: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
