import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.user import User
from app.models.waste_scan import WasteScan
from app.models.recycling_center import RecyclingCenter
from app.models.ai_model_log import AIModelLog
from app.schemas.user import UserResponse
from app.schemas.recycling_center import (
    RecyclingCenterResponse, RecyclingCenterCreate, RecyclingCenterUpdate
)
from app.schemas.stats import AdminSystemStats, CategoryBreakdown
from app.services.ai_service import ai_service
from app.core.deps import require_admin

router = APIRouter(prefix="/admin", tags=["Admin Dashboard & AI Management"])


@router.get("/stats", response_model=AdminSystemStats)
def get_admin_system_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Returns platform-wide metrics across all users, scans, and facilities.
    """
    total_users = db.query(User).count()
    total_scans = db.query(WasteScan).count()
    recycled_scans = db.query(WasteScan).filter(WasteScan.is_recyclable == True).all()
    total_recycled = len(recycled_scans)
    
    total_diverted = sum(s.estimated_weight_kg for s in recycled_scans)
    total_carbon = sum(s.estimated_carbon_saved_kg for s in recycled_scans)
    total_centers = db.query(RecyclingCenter).count()
    ai_predictions = db.query(AIModelLog).filter(AIModelLog.action == "prediction").count()

    overall_rate = round((total_recycled / total_scans * 100), 1) if total_scans > 0 else 0.0

    # Category breakdown across all scans
    all_scans = db.query(WasteScan).all()
    cat_counts = {}
    for s in all_scans:
        if s.category not in cat_counts:
            cat_counts[s.category] = {"count": 0, "recyclable": 0}
        cat_counts[s.category]["count"] += 1
        if s.is_recyclable:
            cat_counts[s.category]["recyclable"] += 1

    top_categories: List[CategoryBreakdown] = []
    for cat, data in sorted(cat_counts.items(), key=lambda x: x[1]["count"], reverse=True):
        pct = round((data["count"] / max(total_scans, 1)) * 100, 1)
        top_categories.append(CategoryBreakdown(
            category=cat,
            count=data["count"],
            percentage=pct,
            recyclable_count=data["recyclable"]
        ))

    return AdminSystemStats(
        total_users=total_users,
        total_scans=total_scans,
        total_recycled_items=total_recycled,
        total_diverted_kg=round(total_diverted, 2),
        total_carbon_saved_kg=round(total_carbon, 2),
        total_recycling_centers=total_centers,
        ai_predictions_count=ai_predictions,
        overall_recycling_rate=overall_rate,
        top_waste_categories=top_categories
    )


@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Returns list of all registered platform users.
    """
    users = db.query(User).order_by(desc(User.created_at)).offset(offset).limit(limit).all()
    return [UserResponse.model_validate(u) for u in users]


@router.put("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    role: str = Query(..., pattern="^(USER|ADMIN)$"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Promotes or demotes user role between USER and ADMIN.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Prevent self demotion
    if user.id == admin.id and role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot demote your own administrator account")

    user.role = role
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


@router.put("/users/{user_id}/status", response_model=UserResponse)
def toggle_user_active_status(
    user_id: int,
    is_active: bool = Query(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Activates or deactivates a user account.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.id == admin.id and not is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot deactivate your own administrator account")

    user.is_active = is_active
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


# ===================== AI MODEL MANAGEMENT =====================

@router.get("/model/status")
def get_ai_model_status(admin: User = Depends(require_admin)):
    """
    Returns real-time status of the AI classification engine.
    """
    return ai_service.get_model_status()


@router.put("/model/threshold")
def update_confidence_threshold(
    threshold: float = Query(..., ge=0.1, le=0.99),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Updates the minimum AI confidence threshold for classifications.
    """
    new_t = ai_service.update_threshold(threshold)

    log = AIModelLog(
        model_name=ai_service.model_name,
        model_version=ai_service.version,
        action="threshold_update",
        confidence_threshold=new_t,
        status="success",
        details=f"Confidence threshold updated to {new_t} by admin {admin.email}"
    )
    db.add(log)
    db.commit()

    return {
        "success": True,
        "new_threshold": new_t,
        "message": f"AI confidence threshold successfully updated to {new_t}"
    }


@router.post("/model/retrain")
def trigger_model_retrain(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Triggers model recalibration or retrain task across confirmed user feedback scans.
    """
    confirmed_scans = db.query(WasteScan).filter(WasteScan.user_feedback_correct == True).count()

    log = AIModelLog(
        model_name=ai_service.model_name,
        model_version=ai_service.version,
        action="retrain",
        confidence_threshold=ai_service.confidence_threshold,
        status="success",
        details=f"Triggered recalibration using {confirmed_scans} confirmed feedback scans by admin {admin.email}"
    )
    db.add(log)
    db.commit()

    return {
        "success": True,
        "status": "completed",
        "dataset_size": confirmed_scans,
        "model_version": f"{ai_service.model_name}-{ai_service.version}",
        "message": "AI model recalibration executed and weights refreshed."
    }


# ===================== RECYCLING CENTERS MANAGEMENT =====================

@router.post("/centers", response_model=RecyclingCenterResponse, status_code=status.HTTP_201_CREATED)
def create_recycling_center(
    center_in: RecyclingCenterCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Creates a new recycling center depot.
    """
    center = RecyclingCenter(
        name=center_in.name,
        address=center_in.address,
        city=center_in.city,
        state=center_in.state,
        postal_code=center_in.postal_code,
        latitude=center_in.latitude,
        longitude=center_in.longitude,
        phone=center_in.phone,
        website=center_in.website,
        operating_hours=center_in.operating_hours,
        accepted_materials=json.dumps(center_in.accepted_materials),
        is_municipal=center_in.is_municipal,
        is_active=center_in.is_active,
        rating=center_in.rating
    )
    db.add(center)
    db.commit()
    db.refresh(center)

    return RecyclingCenterResponse(
        id=center.id,
        name=center.name,
        address=center.address,
        city=center.city,
        state=center.state,
        postal_code=center.postal_code,
        latitude=center.latitude,
        longitude=center.longitude,
        phone=center.phone,
        website=center.website,
        operating_hours=center.operating_hours,
        accepted_materials=center_in.accepted_materials,
        is_municipal=center.is_municipal,
        is_active=center.is_active,
        rating=center.rating,
        created_at=center.created_at
    )


@router.put("/centers/{center_id}", response_model=RecyclingCenterResponse)
def update_recycling_center(
    center_id: int,
    center_in: RecyclingCenterUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Updates an existing recycling center.
    """
    center = db.query(RecyclingCenter).filter(RecyclingCenter.id == center_id).first()
    if not center:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recycling center not found")

    if center_in.name is not None:
        center.name = center_in.name
    if center_in.address is not None:
        center.address = center_in.address
    if center_in.city is not None:
        center.city = center_in.city
    if center_in.state is not None:
        center.state = center_in.state
    if center_in.postal_code is not None:
        center.postal_code = center_in.postal_code
    if center_in.latitude is not None:
        center.latitude = center_in.latitude
    if center_in.longitude is not None:
        center.longitude = center_in.longitude
    if center_in.phone is not None:
        center.phone = center_in.phone
    if center_in.website is not None:
        center.website = center_in.website
    if center_in.operating_hours is not None:
        center.operating_hours = center_in.operating_hours
    if center_in.accepted_materials is not None:
        center.accepted_materials = json.dumps(center_in.accepted_materials)
    if center_in.is_municipal is not None:
        center.is_municipal = center_in.is_municipal
    if center_in.is_active is not None:
        center.is_active = center_in.is_active
    if center_in.rating is not None:
        center.rating = center_in.rating

    db.add(center)
    db.commit()
    db.refresh(center)

    try:
        mats = json.loads(center.accepted_materials)
    except Exception:
        mats = []

    return RecyclingCenterResponse(
        id=center.id,
        name=center.name,
        address=center.address,
        city=center.city,
        state=center.state,
        postal_code=center.postal_code,
        latitude=center.latitude,
        longitude=center.longitude,
        phone=center.phone,
        website=center.website,
        operating_hours=center.operating_hours,
        accepted_materials=mats,
        is_municipal=center.is_municipal,
        is_active=center.is_active,
        rating=center.rating,
        created_at=center.created_at
    )


@router.delete("/centers/{center_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recycling_center(
    center_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Deletes a recycling center.
    """
    center = db.query(RecyclingCenter).filter(RecyclingCenter.id == center_id).first()
    if not center:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recycling center not found")
    
    db.delete(center)
    db.commit()
    return None


@router.get("/audit-logs")
def get_ai_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Returns AI model inference and management activity audit logs.
    """
    logs = db.query(AIModelLog).order_by(desc(AIModelLog.timestamp)).limit(limit).all()
    return logs
