import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.recycling_center import RecyclingCenter
from app.schemas.recycling_center import (
    RecyclingCenterResponse, RecyclingCenterCreate, RecyclingCenterUpdate
)
from app.services.distance_service import haversine_distance_km
from app.core.deps import require_admin

router = APIRouter(prefix="/centers", tags=["Recycling Centers & Map"])


@router.get("/nearby", response_model=List[RecyclingCenterResponse])
def get_nearby_recycling_centers(
    lat: Optional[float] = Query(None, description="User latitude"),
    lng: Optional[float] = Query(None, description="User longitude"),
    radius_km: float = Query(50.0, ge=1.0, le=500.0, description="Radius search in kilometers"),
    material: Optional[str] = Query(None, description="Filter by accepted waste material"),
    search: Optional[str] = Query(None, description="Search center name or city"),
    db: Session = Depends(get_db)
):
    """
    Finds nearby recycling centers.
    Calculates geographic distance, applies material filters, and sorts by closest proximity.
    """
    query = db.query(RecyclingCenter).filter(RecyclingCenter.is_active == True)

    if search:
        s = f"%{search}%"
        query = query.filter(
            (RecyclingCenter.name.ilike(s)) |
            (RecyclingCenter.city.ilike(s)) |
            (RecyclingCenter.address.ilike(s))
        )

    centers = query.all()
    results: List[RecyclingCenterResponse] = []

    for c in centers:
        # Parse materials JSON
        try:
            mats = json.loads(c.accepted_materials) if c.accepted_materials else []
        except Exception:
            mats = []

        # Filter by material if specified
        if material and material.lower() != "all":
            if not any(material.lower() in m.lower() for m in mats):
                continue

        # Calculate distance if user coords provided
        dist: Optional[float] = None
        if lat is not None and lng is not None:
            dist = haversine_distance_km(lat, lng, c.latitude, c.longitude)
            if dist > radius_km:
                continue

        item_dict = {
            "id": c.id,
            "name": c.name,
            "address": c.address,
            "city": c.city,
            "state": c.state,
            "postal_code": c.postal_code,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "phone": c.phone,
            "website": c.website,
            "operating_hours": c.operating_hours,
            "accepted_materials": mats,
            "is_municipal": c.is_municipal,
            "is_active": c.is_active,
            "rating": c.rating,
            "distance_km": dist,
            "created_at": c.created_at
        }
        results.append(RecyclingCenterResponse(**item_dict))

    # Sort results
    if lat is not None and lng is not None:
        results.sort(key=lambda x: (x.distance_km is None, x.distance_km))
    else:
        results.sort(key=lambda x: x.name)

    return results


@router.get("/materials", response_model=List[str])
def get_accepted_material_types():
    """
    Returns the distinct list of waste material categories accepted across centers.
    """
    return [
        "Plastic",
        "Paper & Cardboard",
        "Glass",
        "Metal",
        "Organic / Compost",
        "E-Waste",
        "Hazardous"
    ]


@router.get("/{center_id}", response_model=RecyclingCenterResponse)
def get_center_by_id(center_id: int, db: Session = Depends(get_db)):
    """
    Returns details for a single recycling center.
    """
    c = db.query(RecyclingCenter).filter(RecyclingCenter.id == center_id).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recycling center not found")

    try:
        mats = json.loads(c.accepted_materials) if c.accepted_materials else []
    except Exception:
        mats = []

    return RecyclingCenterResponse(
        id=c.id,
        name=c.name,
        address=c.address,
        city=c.city,
        state=c.state,
        postal_code=c.postal_code,
        latitude=c.latitude,
        longitude=c.longitude,
        phone=c.phone,
        website=c.website,
        operating_hours=c.operating_hours,
        accepted_materials=mats,
        is_municipal=c.is_municipal,
        is_active=c.is_active,
        rating=c.rating,
        created_at=c.created_at
    )
