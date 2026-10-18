from datetime import datetime, timedelta, timezone
from typing import List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.waste_scan import WasteScan
from app.schemas.stats import (
    UserDashboardStats, SustainabilityScoreResponse, CategoryBreakdown,
    MonthlyTrendPoint, WeeklyActivityPoint
)
from app.services.sustainability_service import calculate_sustainability_metrics
from app.services.recommendation_service import get_personalized_recommendations
from app.core.deps import get_current_user

router = APIRouter(prefix="/stats", tags=["Dashboard & Statistics"])


@router.get("/dashboard", response_model=UserDashboardStats)
def get_user_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns aggregated dashboard statistics, visual chart breakdowns,
    sustainability metrics, and personalized eco recommendations for the current user.
    """
    # 1. Sustainability score & badges
    sustainability_data = calculate_sustainability_metrics(current_user)
    sustainability = SustainabilityScoreResponse(**sustainability_data)

    # 2. Category Breakdown
    scans = db.query(WasteScan).filter(WasteScan.user_id == current_user.id).all()
    total_scans = len(scans)

    cat_counts: Dict[str, Dict[str, int]] = {}
    for s in scans:
        if s.category not in cat_counts:
            cat_counts[s.category] = {"count": 0, "recyclable": 0}
        cat_counts[s.category]["count"] += 1
        if s.is_recyclable:
            cat_counts[s.category]["recyclable"] += 1

    category_breakdown: List[CategoryBreakdown] = []
    top_categories: List[str] = []

    sorted_cats = sorted(cat_counts.items(), key=lambda x: x[1]["count"], reverse=True)
    for cat, data in sorted_cats:
        pct = round((data["count"] / total_scans) * 100, 1) if total_scans > 0 else 0.0
        category_breakdown.append(CategoryBreakdown(
            category=cat,
            count=data["count"],
            percentage=pct,
            recyclable_count=data["recyclable"]
        ))
        top_categories.append(cat)

    # If user has no scans yet, provide placeholder breakdown so charts render nicely
    if not category_breakdown:
        category_breakdown = [
            CategoryBreakdown(category="Plastic", count=0, percentage=0.0, recyclable_count=0),
            CategoryBreakdown(category="Paper & Cardboard", count=0, percentage=0.0, recyclable_count=0),
            CategoryBreakdown(category="Glass", count=0, percentage=0.0, recyclable_count=0),
            CategoryBreakdown(category="Metal", count=0, percentage=0.0, recyclable_count=0)
        ]

    # 3. Weekly Activity (last 7 days)
    today = datetime.now(timezone.utc).date()
    weekly_activity: List[WeeklyActivityPoint] = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_str = day.strftime("%a")
        day_scans = [s for s in scans if s.created_at.date() == day]
        recycled_day = len([s for s in day_scans if s.is_recyclable])
        weekly_activity.append(WeeklyActivityPoint(
            day=day_str,
            scans=len(day_scans),
            recycled=recycled_day
        ))

    # 4. Monthly Trend (last 4 months)
    monthly_trends: List[MonthlyTrendPoint] = []
    current_year = today.year
    current_month = today.month

    for offset in range(3, -1, -1):
        target_month = current_month - offset
        target_year = current_year
        if target_month <= 0:
            target_month += 12
            target_year -= 1
        month_label = datetime(target_year, target_month, 1).strftime("%b %Y")
        
        m_scans = [s for s in scans if s.created_at.year == target_year and s.created_at.month == target_month]
        m_recycled = len([s for s in m_scans if s.is_recyclable])
        m_diverted = sum(s.estimated_weight_kg for s in m_scans if s.is_recyclable)

        monthly_trends.append(MonthlyTrendPoint(
            month=month_label,
            scans_count=len(m_scans),
            recycled_count=m_recycled,
            diverted_kg=round(m_diverted, 2)
        ))

    # 5. Personalized Recommendations
    recommendations = get_personalized_recommendations(current_user, top_categories)

    return UserDashboardStats(
        sustainability=sustainability,
        category_breakdown=category_breakdown,
        monthly_trends=monthly_trends,
        weekly_activity=weekly_activity,
        recommendations=recommendations
    )


@router.get("/sustainability", response_model=SustainabilityScoreResponse)
def get_user_sustainability_score(current_user: User = Depends(get_current_user)):
    """
    Returns standalone sustainability score, tier, streak, and badges.
    """
    stats = calculate_sustainability_metrics(current_user)
    return SustainabilityScoreResponse(**stats)
