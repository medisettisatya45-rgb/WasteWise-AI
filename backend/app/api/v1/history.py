from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.user import User
from app.models.waste_scan import WasteScan
from app.schemas.waste_scan import WasteScanResponse, WasteScanListResponse, FeedbackUpdate
from app.core.deps import get_current_user

router = APIRouter(prefix="/history", tags=["Scan History"])


@router.get("", response_model=WasteScanListResponse)
def get_user_scan_history(
    category: Optional[str] = Query(None, description="Filter by category"),
    is_recyclable: Optional[bool] = Query(None, description="Filter by recyclability"),
    search: Optional[str] = Query(None, description="Search category or notes"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns paginated scan history for the authenticated user with optional filtering.
    """
    query = db.query(WasteScan).filter(WasteScan.user_id == current_user.id)

    if category:
        query = query.filter(WasteScan.category == category)
    if is_recyclable is not None:
        query = query.filter(WasteScan.is_recyclable == is_recyclable)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (WasteScan.category.ilike(s)) |
            (WasteScan.subcategory.ilike(s)) |
            (WasteScan.notes.ilike(s))
        )

    total = query.count()
    items = query.order_by(desc(WasteScan.created_at)).offset(offset).limit(limit).all()

    return WasteScanListResponse(
        total=total,
        items=[WasteScanResponse.model_validate(x) for x in items]
    )


@router.get("/{scan_id}", response_model=WasteScanResponse)
def get_scan_detail(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns full details for a single waste scan.
    """
    scan = db.query(WasteScan).filter(
        WasteScan.id == scan_id,
        WasteScan.user_id == current_user.id
    ).first()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found"
        )

    return WasteScanResponse.model_validate(scan)


@router.post("/{scan_id}/feedback", response_model=WasteScanResponse)
def submit_scan_feedback(
    scan_id: int,
    feedback: FeedbackUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Allows user to provide accuracy feedback on AI classification.
    """
    scan = db.query(WasteScan).filter(
        WasteScan.id == scan_id,
        WasteScan.user_id == current_user.id
    ).first()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found"
        )

    scan.user_feedback_correct = feedback.user_feedback_correct
    if feedback.notes:
        scan.notes = feedback.notes

    db.add(scan)
    db.commit()
    db.refresh(scan)
    return WasteScanResponse.model_validate(scan)


@router.delete("/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deletes a scan record from the user's history.
    """
    scan = db.query(WasteScan).filter(
        WasteScan.id == scan_id,
        WasteScan.user_id == current_user.id
    ).first()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found"
        )

    db.delete(scan)
    db.commit()
    return None
