from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# ==========================================
# COMPLAINT DATA MODELS
# ==========================================

class ComplaintCreate(BaseModel):
    """Schema for incoming complaint submission."""
    message: str = Field(..., description="The complaint description text")
    category: Optional[str] = Field(None, description="User-selected category")
    citizen_name: str = Field(..., description="Name of the citizen submitting the complaint")
    city: str = Field(..., description="City of the citizen")

class WorkerInfo(BaseModel):
    """Schema for basic worker information in responses."""
    worker_id: str
    name: str
    department: str
    designation: Optional[str] = None

class ComplaintResponse(BaseModel):
    """Schema for the full complaint object returned to the user."""
    id: str
    message: str
    category: str
    priority: str
    citizen_name: str
    city: str
    assigned_worker: Optional[WorkerInfo] = None
    status: str
    created_at: datetime
    completion_note: Optional[str] = None
    completion_image: Optional[str] = None
    gps_coordinates: Optional[str] = None
    rating: Optional[int] = None
    feedback: Optional[str] = None

class ResolutionUpdate(BaseModel):
    """Schema for marking a complaint as resolved."""
    completion_note: str
    completion_image: Optional[str] = None
    gps_coordinates: Optional[str] = None

class CitizenFeedback(BaseModel):
    """Schema for citizen rating and feedback."""
    rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = None
