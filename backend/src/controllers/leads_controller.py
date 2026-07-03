from fastapi import APIRouter, HTTPException
from src.schemas import LoginRequest
from src.services.leads_services import LeadsServices

router = APIRouter()
svc = LeadsServices()

@router.post("/login")
def login(data: LoginRequest):
    result = svc.login(data)
    if not result:
        raise HTTPException(status_code=401, detail="Clave inválida")
    return result
