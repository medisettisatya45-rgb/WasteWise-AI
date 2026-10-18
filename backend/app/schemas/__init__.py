from app.schemas.user import (
    UserBase, UserCreate, UserLogin, UserUpdate, PasswordChangeRequest, UserResponse, Token, TokenData
)
from app.schemas.waste_scan import (
    WasteScanResponse, WasteScanListResponse, WasteScanCreate, FeedbackUpdate,
    WastePredictionResponse, DisposalInstruction
)
from app.schemas.recycling_center import (
    RecyclingCenterBase, RecyclingCenterCreate, RecyclingCenterUpdate, RecyclingCenterResponse
)
from app.schemas.stats import (
    UserDashboardStats, CategoryBreakdown, MonthlyTrendPoint, WeeklyActivityPoint,
    EcoRecommendationItem, SustainabilityScoreResponse, AdminSystemStats
)
from app.schemas.notification import NotificationResponse, NotificationCreate

__all__ = [
    "UserBase", "UserCreate", "UserLogin", "UserUpdate", "PasswordChangeRequest", "UserResponse", "Token", "TokenData",
    "WasteScanResponse", "WasteScanListResponse", "WasteScanCreate", "FeedbackUpdate", "WastePredictionResponse", "DisposalInstruction",
    "RecyclingCenterBase", "RecyclingCenterCreate", "RecyclingCenterUpdate", "RecyclingCenterResponse",
    "UserDashboardStats", "CategoryBreakdown", "MonthlyTrendPoint", "WeeklyActivityPoint", "EcoRecommendationItem", "SustainabilityScoreResponse", "AdminSystemStats",
    "NotificationResponse", "NotificationCreate"
]
