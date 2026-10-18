from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from app.core.security import validate_password_rules, MAX_PASSWORD_BYTES, MIN_PASSWORD_LENGTH


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=MIN_PASSWORD_LENGTH)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        validate_password_rules(v)
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(...)


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    avatar_url: Optional[str] = Field(None, max_length=500)


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=MIN_PASSWORD_LENGTH)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        validate_password_rules(v)
        return v


class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    avatar_url: Optional[str] = None
    sustainability_score: int
    eco_tier: str
    current_streak: int
    last_scan_date: Optional[date] = None
    total_scans_count: int
    total_recycled_count: int
    diverted_weight_kg: float
    carbon_saved_kg: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None
