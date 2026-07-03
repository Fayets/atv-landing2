from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LeadCreate(BaseModel):
    name: str
    email: str
    phone: str


class LeadUpdate(BaseModel):
    contacted: Optional[bool] = None
    notes: Optional[str] = None


class LeadOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    access_code: str
    created_at: datetime
    contacted: bool
    notes: Optional[str] = None
