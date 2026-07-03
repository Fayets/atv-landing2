from datetime import datetime
from pony.orm import db_session
from src.models import Lead
from src.schemas import LoginRequest

class LeadsServices:

    def login(self, data: LoginRequest) -> dict | None:
        with db_session:
            lead = Lead.get(access_code=data.access_code.strip().upper())
            if not lead:
                return None
            lead.last_access = datetime.utcnow()
            return self._to_dict(lead)

    def _to_dict(self, lead) -> dict:
        return {
            "id": lead.id,
            "name": lead.name,
            "email": lead.email,
            "phone": lead.phone,
            "access_code": lead.access_code,
            "created_at": lead.created_at.isoformat(),
            "last_access": lead.last_access.isoformat() if lead.last_access else None,
        }
