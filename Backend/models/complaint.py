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
