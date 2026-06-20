import csv
import io

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from src.schemas import LeadCreate, LeadUpdate
from src.services.leads_services import LeadsServices

router = APIRouter()
service = LeadsServices()


@router.post("/", response_model=dict, status_code=201)
def create_lead(data: LeadCreate):
    try:
        return service.create_lead(data)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/", response_model=list)
def list_leads():
    try:
        return service.get_all_leads()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/metrics")
def get_metrics():
    try:
        return service.get_metrics()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/export/csv")
def export_csv():
    try:
        leads = service.get_all_leads()
        output = io.StringIO()
        fieldnames = [
            "id", "name", "email", "phone", "situation", "revenue",
            "obstacle", "niche", "created_at", "contacted", "notes",
        ]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(leads)
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=atv-leads.csv"},
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/{lead_id}")
def get_lead(lead_id: int):
    try:
        lead = service.get_lead_by_id(lead_id)
        if not lead:
            raise HTTPException(status_code=404, detail="Lead no encontrado")
        return lead
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.patch("/{lead_id}")
def update_lead(lead_id: int, data: LeadUpdate):
    try:
        lead = service.update_lead(lead_id, data)
        if not lead:
            raise HTTPException(status_code=404, detail="Lead no encontrado")
        return lead
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno del servidor")
