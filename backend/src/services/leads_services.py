from datetime import datetime, timedelta

from pony.orm import db_session, desc

from src.models import Lead
from src.schemas import LeadCreate, LeadUpdate


class LeadsServices:
    def create_lead(self, data: LeadCreate) -> dict:
        with db_session:
            lead = Lead(
                name=data.name,
                email=data.email,
                phone=data.phone,
                situation=data.situation,
                revenue=data.revenue,
                obstacle=data.obstacle,
                niche=data.niche,
                created_at=datetime.utcnow(),
                contacted=False,
            )
            return {"ok": True, "id": lead.id}

    def get_all_leads(self) -> list[dict]:
        with db_session:
            leads = Lead.select().order_by(lambda l: desc(l.created_at))[:]
            return [self._to_dict(l) for l in leads]

    def get_lead_by_id(self, lead_id: int) -> dict | None:
        with db_session:
            lead = Lead.get(id=lead_id)
            return self._to_dict(lead) if lead else None

    def update_lead(self, lead_id: int, data: LeadUpdate) -> dict | None:
        with db_session:
            lead = Lead.get(id=lead_id)
            if not lead:
                return None
            if data.contacted is not None:
                lead.contacted = data.contacted
            if data.notes is not None:
                lead.notes = data.notes
            return self._to_dict(lead)

    def get_metrics(self) -> dict:
        with db_session:
            leads = Lead.select()[:]
            total = len(leads)
            contacted = sum(1 for l in leads if l.contacted)

            by_niche: dict[str, int] = {}
            by_situation: dict[str, int] = {}
            by_revenue: dict[str, int] = {}

            for lead in leads:
                niche = lead.niche or "Sin nicho"
                by_niche[niche] = by_niche.get(niche, 0) + 1

                situation = lead.situation or "Sin dato"
                by_situation[situation] = by_situation.get(situation, 0) + 1

                revenue = lead.revenue or "Sin dato"
                by_revenue[revenue] = by_revenue.get(revenue, 0) + 1

            today = datetime.utcnow().date()
            daily = []
            for i in range(13, -1, -1):
                day = today - timedelta(days=i)
                daily.append({"date": day.isoformat(), "count": 0})

            day_index = {entry["date"]: idx for idx, entry in enumerate(daily)}
            for lead in leads:
                key = lead.created_at.date().isoformat()
                if key in day_index:
                    daily[day_index[key]]["count"] += 1

            return {
                "total": total,
                "contacted": contacted,
                "pending": total - contacted,
                "by_niche": by_niche,
                "by_situation": by_situation,
                "by_revenue": by_revenue,
                "daily": daily,
            }

    def _to_dict(self, lead) -> dict:
        return {
            "id": lead.id,
            "name": lead.name,
            "email": lead.email,
            "phone": lead.phone,
            "situation": lead.situation,
            "revenue": lead.revenue,
            "obstacle": lead.obstacle,
            "niche": lead.niche,
            "created_at": lead.created_at.isoformat(),
            "contacted": lead.contacted,
            "notes": lead.notes,
        }
