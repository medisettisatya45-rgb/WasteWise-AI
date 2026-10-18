import os
import uuid
import json
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.models.waste_scan import WasteScan
from app.models.notification import Notification
from app.models.ai_model_log import AIModelLog
from app.schemas.waste_scan import WastePredictionResponse, WasteScanResponse
from app.services.ai_service import ai_service
from app.services.sustainability_service import (
    calculate_sustainability_metrics, update_user_streak
)
from app.core.deps import get_current_user, get_optional_current_user

router = APIRouter(prefix="/scan", tags=["Waste Scanning & AI"])


@router.post("/classify", response_model=WastePredictionResponse)
async def classify_waste_image(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Analyzes an uploaded waste image using the AI classification engine.
    Returns category, confidence, recyclability, and disposal instructions.
    Does not save to database unless requested or authenticated via /scan/upload-and-save.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid image format (JPEG, PNG, WebP)"
        )

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image size exceeds the 10 MB limit"
        )

    try:
        prediction = ai_service.classify_image(content, filename=file.filename or "waste.jpg")
        return WastePredictionResponse(**prediction)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI model inference error: {str(e)}"
        )


@router.post("/upload-and-save", response_model=WasteScanResponse)
async def upload_and_save_scan(
    file: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Full workflow endpoint:
    1. Validates and saves the image to persistent storage.
    2. Runs AI classification.
    3. Saves WasteScan to user history.
    4. Updates user streaks, sustainability score, and metrics.
    5. Dispatches achievement notifications on milestones.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid image format (JPEG, PNG, WebP)"
        )

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image file size exceeds maximum limit of 10 MB"
        )

    # Generate unique filename and save to storage
    file_ext = Path(file.filename or "item.jpg").suffix.lower()
    if file_ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        file_ext = ".jpg"
    
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    dest_path = settings.UPLOAD_DIR / unique_filename

    with open(dest_path, "wb") as f:
        f.write(content)

    # Relative path for frontend/api serving
    rel_path = f"/uploads/{unique_filename}"

    # Perform AI classification
    try:
        prediction = ai_service.classify_image(content, filename=file.filename or unique_filename)
    except ValueError as e:
        if dest_path.exists():
            dest_path.unlink()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # Persist Scan in database
    prep_steps_str = "\n".join(prediction["preparation_steps"])

    scan = WasteScan(
        user_id=current_user.id,
        image_path=rel_path,
        image_filename=unique_filename,
        category=prediction["category"],
        subcategory=prediction.get("subcategory"),
        confidence=prediction["confidence"],
        is_recyclable=prediction["is_recyclable"],
        material_composition=prediction.get("material_composition"),
        disposal_instructions=prediction["disposal_instructions"],
        preparation_steps=prep_steps_str,
        target_bin_color=prediction["target_bin_color"],
        estimated_carbon_saved_kg=prediction["estimated_carbon_saved_kg"],
        estimated_weight_kg=prediction["estimated_weight_kg"],
        model_version=prediction["model_version"],
        notes=notes
    )
    db.add(scan)

    # Update user metrics
    current_user.total_scans_count += 1
    if prediction["is_recyclable"]:
        current_user.total_recycled_count += 1
        current_user.carbon_saved_kg += prediction["estimated_carbon_saved_kg"]
        current_user.diverted_weight_kg += prediction["estimated_weight_kg"]

    # Update Streak
    update_user_streak(current_user)

    # Recalculate Sustainability Score & Tier
    stats = calculate_sustainability_metrics(current_user)
    current_user.sustainability_score = stats["score"]
    current_user.eco_tier = stats["tier"]

    # Milestone Notifications
    if current_user.total_scans_count == 1:
        notif = Notification(
            user_id=current_user.id,
            title="First Scan Recorded! 📸",
            message=f"You successfully classified your first item: {prediction['category']}.",
            notification_type="achievement"
        )
        db.add(notif)
    elif current_user.total_recycled_count == 5:
        notif = Notification(
            user_id=current_user.id,
            title="Recycling Milestone! ♻️",
            message="You have diverted 5 recyclable items away from landfills!",
            notification_type="achievement"
        )
        db.add(notif)
    elif current_user.current_streak == 3:
        notif = Notification(
            user_id=current_user.id,
            title="3-Day Eco Streak! 🔥",
            message="Consistency matters! You've logged waste scans 3 days in a row.",
            notification_type="achievement"
        )
        db.add(notif)

    # AI Model Audit Log
    log = AIModelLog(
        model_name="WasteWise-VisionNet",
        model_version=prediction["model_version"],
        action="prediction",
        confidence_threshold=settings.AI_CONFIDENCE_THRESHOLD,
        status="success",
        details=f"User {current_user.id} scanned {prediction['category']} with confidence {prediction['confidence']}"
    )
    db.add(log)

    db.commit()
    db.refresh(scan)
    db.refresh(current_user)

    return WasteScanResponse.model_validate(scan)
