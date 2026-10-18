from typing import Dict, Any, List
from datetime import date, timedelta
from app.models.user import User

TIERS = [
    {"name": "Seedling", "min_score": 0, "max_score": 24, "icon": "🌱"},
    {"name": "Eco Explorer", "min_score": 25, "max_score": 49, "icon": "🌿"},
    {"name": "Green Guardian", "min_score": 50, "max_score": 74, "icon": "🌳"},
    {"name": "Earth Champion", "min_score": 75, "max_score": 100, "icon": "🌍"},
]


def calculate_sustainability_metrics(user: User) -> Dict[str, Any]:
    """
    Computes real-time sustainability score, tier, badges, and progress.
    Score formula combines:
    - Scan volume (up to 30 pts)
    - Recycling ratio (up to 40 pts)
    - Consecutive streak activity (up to 20 pts)
    - Diverted carbon impact (up to 10 pts)
    """
    total = user.total_scans_count
    recycled = user.total_recycled_count
    streak = user.current_streak
    carbon = user.carbon_saved_kg

    # Recycling rate
    recycling_rate = round((recycled / total) * 100, 1) if total > 0 else 0.0

    # Components
    volume_pts = min(30, total * 3)
    recycle_pts = min(40, int(recycling_rate * 0.4))
    streak_pts = min(20, streak * 4)
    carbon_pts = min(10, int(carbon * 5))

    raw_score = volume_pts + recycle_pts + streak_pts + carbon_pts
    final_score = min(100, max(0, raw_score))

    # Determine Tier
    current_tier = "Seedling"
    next_tier = "Eco Explorer"
    points_to_next = 25 - final_score

    for idx, t in enumerate(TIERS):
        if t["min_score"] <= final_score <= t["max_score"]:
            current_tier = t["name"]
            if idx + 1 < len(TIERS):
                next_tier = TIERS[idx + 1]["name"]
                points_to_next = max(0, TIERS[idx + 1]["min_score"] - final_score)
            else:
                next_tier = "Max Tier Reached"
                points_to_next = 0
            break

    # Determine Badges
    badges: List[Dict[str, Any]] = [
        {
            "id": "first_scan",
            "name": "First Step",
            "description": "Completed your first AI waste scan",
            "icon": "📸",
            "unlocked": total >= 1,
            "progress": min(1, total) / 1.0
        },
        {
            "id": "habit_former",
            "name": "Eco Streak",
            "description": "Maintained a 3-day active scanning streak",
            "icon": "🔥",
            "unlocked": streak >= 3,
            "progress": min(3, streak) / 3.0
        },
        {
            "id": "recycling_pro",
            "name": "Resource Saver",
            "description": "Properly diverted 10 recyclable items from landfill",
            "icon": "♻️",
            "unlocked": recycled >= 10,
            "progress": min(10, recycled) / 10.0
        },
        {
            "id": "carbon_cutter",
            "name": "Carbon Offsetter",
            "description": "Saved over 2.0 kg of CO2 equivalent emissions",
            "icon": "🍃",
            "unlocked": carbon >= 2.0,
            "progress": min(2.0, carbon) / 2.0
        },
        {
            "id": "champion",
            "name": "Earth Champion",
            "description": "Attained Earth Champion status with 75+ points",
            "icon": "🌍",
            "unlocked": final_score >= 75,
            "progress": final_score / 75.0
        }
    ]

    return {
        "score": final_score,
        "tier": current_tier,
        "next_tier": next_tier,
        "points_to_next_tier": points_to_next,
        "streak_days": streak,
        "total_scans": total,
        "recycled_count": recycled,
        "recycling_rate": recycling_rate,
        "carbon_saved_kg": round(carbon, 2),
        "diverted_weight_kg": round(user.diverted_weight_kg, 2),
        "badges": badges
    }


def update_user_streak(user: User) -> int:
    """
    Updates the user's consecutive day streak based on the current date.
    """
    today = date.today()
    if user.last_scan_date is None:
        user.current_streak = 1
        user.last_scan_date = today
    elif user.last_scan_date == today:
        pass  # Already scanned today, keep streak
    elif user.last_scan_date == today - timedelta(days=1):
        user.current_streak += 1
        user.last_scan_date = today
    else:
        # Missed a day
        user.current_streak = 1
        user.last_scan_date = today

    return user.current_streak
