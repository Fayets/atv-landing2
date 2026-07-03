from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LoginRequest(BaseModel):
    access_code: str

class LeadOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    access_code: str
    created_at: datetime
    last_access: Optional[datetime] = None
