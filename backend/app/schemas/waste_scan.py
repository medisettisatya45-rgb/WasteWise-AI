from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class DisposalInstruction(BaseModel):
    step_number: int
    title: str
    description: str


class WastePredictionResponse(BaseModel):
    category: str
    subcategory: Optional[str] = None
    confidence: float
    is_recyclable: bool
    material_composition: Optional[str] = None
    target_bin_color: str
    disposal_instructions: str
    preparation_steps: List[str]
    estimated_carbon_saved_kg: float
    estimated_weight_kg: float
    model_version: str
    model_status: str = "operational"
    model_message: Optional[str] = None


class WasteScanCreate(BaseModel):
    category: str
    subcategory: Optional[str] = None
    confidence: float
    is_recyclable: bool
    material_composition: Optional[str] = None
    target_bin_color: str
    disposal_instructions: str
    preparation_steps: Optional[str] = None
    estimated_carbon_saved_kg: float = 0.0
    estimated_weight_kg: float = 0.1
    model_version: str = "WasteWise-Net-v1.0"
    notes: Optional[str] = None


class FeedbackUpdate(BaseModel):
    user_feedback_correct: bool
    notes: Optional[str] = None


class WasteScanResponse(BaseModel):
    id: int
    user_id: int
    image_path: str
    image_filename: str
    category: str
    subcategory: Optional[str] = None
    confidence: float
    is_recyclable: bool
    material_composition: Optional[str] = None
    disposal_instructions: str
    preparation_steps: Optional[str] = None
    target_bin_color: str
    estimated_carbon_saved_kg: float
    estimated_weight_kg: float
    user_feedback_correct: Optional[bool] = None
    model_version: str
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WasteScanListResponse(BaseModel):
    total: int
    items: List[WasteScanResponse]
