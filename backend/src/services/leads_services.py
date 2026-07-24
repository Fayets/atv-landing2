from datetime import datetime
from pony.orm import db_session
from src.models import Lead
from src.schemas import LoginRequest

# Clave de prueba: siempre dispara el video intro. Sacar cuando ya no haga falta.
TEST_INTRO_CODE = "ATV-INTRO"

class LeadsServices:

    def login(self, data: LoginRequest) -> dict | None:
        code = data.access_code.strip().upper()

        if code == TEST_INTRO_CODE:
            return {
                "id": 0,
                "name": "Usuario Prueba Intro",
                "email": "intro@test.local",
                "phone": "",
                "access_code": TEST_INTRO_CODE,
                "created_at": datetime.utcnow().isoformat(),
                "last_access": None,
                "is_first_login": True,
            }

        with db_session:
            lead = Lead.get(access_code=code)
            if not lead:
                return None
            is_first_login = lead.last_access is None
            lead.access_count = (lead.access_count or 0) + 1
            lead.last_access = datetime.utcnow()
            result = self._to_dict(lead)
            result["is_first_login"] = is_first_login
            return result

    def _to_dict(self, lead) -> dict:
        return {
            "id": lead.id,
            "name": lead.name,
            "email": lead.email,
            "phone": lead.phone,
            "access_code": lead.access_code,
            "created_at": lead.created_at.isoformat(),
            "last_access": lead.last_access.isoformat() if lead.last_access else None,
            "access_count": lead.access_count or 0,
        }
