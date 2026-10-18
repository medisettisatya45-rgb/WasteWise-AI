from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class CategoryBreakdown(BaseModel):
    category: str
    count: int
    percentage: float
    recyclable_count: int


class MonthlyTrendPoint(BaseModel):
    month: str
    scans_count: int
    recycled_count: int
    diverted_kg: float


class WeeklyActivityPoint(BaseModel):
    day: str
    scans: int
    recycled: int


class EcoRecommendationItem(BaseModel):
    id: str
    title: str
    description: str
    category: str
    impact: str  # "High", "Medium", "Easy Win"
    estimated_saving: str


class SustainabilityScoreResponse(BaseModel):
    score: int
    tier: str
    streak_days: int
    total_scans: int
    recycled_count: int
    recycling_rate: float
    carbon_saved_kg: float
    diverted_weight_kg: float
    next_tier: Optional[str] = None
    points_to_next_tier: int = 0
    badges: List[Dict[str, Any]]


class UserDashboardStats(BaseModel):
    sustainability: SustainabilityScoreResponse
    category_breakdown: List[CategoryBreakdown]
    monthly_trends: List[MonthlyTrendPoint]
    weekly_activity: List[WeeklyActivityPoint]
    recommendations: List[EcoRecommendationItem]


class AdminSystemStats(BaseModel):
    total_users: int
    total_scans: int
    total_recycled_items: int
    total_diverted_kg: float
    total_carbon_saved_kg: float
    total_recycling_centers: int
    ai_predictions_count: int
    overall_recycling_rate: float
    top_waste_categories: List[CategoryBreakdown]
