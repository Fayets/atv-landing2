from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    situation: Optional[str] = None
    revenue: Optional[str] = None
    obstacle: Optional[str] = None
    niche: Optional[str] = None


class LeadOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    situation: Optional[str]
    revenue: Optional[str]
    obstacle: Optional[str]
    niche: Optional[str]
    created_at: datetime
    contacted: bool
    notes: Optional[str]

    model_config = {"from_attributes": True}


class LeadUpdate(BaseModel):
    contacted: Optional[bool] = None
    notes: Optional[str] = None
