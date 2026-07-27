from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone

from services.opportunity_service import get_opportunity_service, reset_opportunity_service


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI(title="Bloodhound Intelligence API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("bloodhound")


class StatusUpdate(BaseModel):
    status: str


class MissionUpdate(BaseModel):
    daily_mission: str


class ActivityEntry(BaseModel):
    type: str
    note: Optional[str] = None


class FieldUpdate(BaseModel):
    status: Optional[str] = None
    ryans_decision: Optional[str] = None
    next_follow_up: Optional[str] = None
    outcome: Optional[str] = None


@api_router.get("/")
async def root():
    return {"service": "Bloodhound Intelligence API", "status": "online"}


@api_router.get("/health")
async def health():
    svc = get_opportunity_service()
    return {"ok": True, "backend": svc.backend_name, "count": svc.count()}


@api_router.get("/opportunities")
async def list_opportunities(
    source: Optional[str] = None,
    status: Optional[str] = None,
    priority_band: Optional[str] = None,
    daily_mission: Optional[str] = None,
    project_type: Optional[str] = None,
    min_score: Optional[float] = None,
    q: Optional[str] = None,
):
    svc = get_opportunity_service()
    return svc.list(
        source=source,
        status=status,
        priority_band=priority_band,
        daily_mission=daily_mission,
        project_type=project_type,
        min_score=min_score,
        q=q,
    )


@api_router.get("/opportunities/summary")
async def summary():
    svc = get_opportunity_service()
    return svc.summary()


@api_router.get("/opportunities/missions")
async def missions_grouped():
    svc = get_opportunity_service()
    return svc.group_by_mission()


@api_router.get("/opportunities/pipeline")
async def pipeline():
    svc = get_opportunity_service()
    return svc.pipeline_counts()


@api_router.get("/opportunities/recent")
async def recent(limit: int = 10):
    svc = get_opportunity_service()
    return svc.recent(limit=limit)


@api_router.get("/opportunities/top")
async def top(limit: int = 10):
    svc = get_opportunity_service()
    return svc.top(limit=limit)


@api_router.get("/opportunities/{opp_id}")
async def get_opportunity(opp_id: str):
    svc = get_opportunity_service()
    opp = svc.get(opp_id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp


@api_router.patch("/opportunities/{opp_id}/status")
async def update_status(opp_id: str, body: StatusUpdate):
    svc = get_opportunity_service()
    updated = svc.update_status(opp_id, body.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return updated


@api_router.patch("/opportunities/{opp_id}/mission")
async def update_mission(opp_id: str, body: MissionUpdate):
    svc = get_opportunity_service()
    updated = svc.update_mission(opp_id, body.daily_mission)
    if not updated:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return updated


@api_router.post("/opportunities/{opp_id}/activity")
async def add_activity(opp_id: str, body: ActivityEntry):
    svc = get_opportunity_service()
    updated = svc.add_activity(opp_id, body.type, body.note)
    if not updated:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return updated


@api_router.patch("/opportunities/{opp_id}/fields")
async def update_fields(opp_id: str, body: FieldUpdate):
    svc = get_opportunity_service()
    payload = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    if not payload:
        raise HTTPException(status_code=400, detail="No editable fields provided")
    if hasattr(svc, "update_fields"):
        updated = svc.update_fields(opp_id, payload)
    else:
        # Sample backend: apply supported keys one-by-one
        updated = svc.get(opp_id)
        if not updated:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        if "status" in payload:
            updated = svc.update_status(opp_id, payload["status"])
        for k in ("ryans_decision", "next_follow_up", "outcome"):
            if k in payload and updated is not None:
                updated[k] = payload[k]
    if not updated:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return updated


@api_router.get("/config")
async def config():
    svc = get_opportunity_service()
    return {
        "airtable_configured": bool(
            os.environ.get("AIRTABLE_API_KEY")
            and os.environ.get("AIRTABLE_BASE_ID")
            and os.environ.get("AIRTABLE_OPPORTUNITIES_TABLE")
        ),
        "airtable_enabled": os.environ.get("AIRTABLE_ENABLED", "").lower() == "true",
        "backend": svc.backend_name,
    }


@api_router.get("/schema")
async def schema():
    svc = get_opportunity_service()
    if hasattr(svc, "schema_report"):
        return svc.schema_report()
    return {"backend": svc.backend_name, "note": "No schema — running on sample data."}


@api_router.get("/cache-status")
async def cache_status():
    svc = get_opportunity_service()
    return svc.cache_status()


@api_router.post("/cache-refresh")
async def cache_refresh():
    svc = get_opportunity_service()
    return svc.force_refresh()


@api_router.post("/admin/reload")
async def reload_service():
    reset_opportunity_service()
    svc = get_opportunity_service()
    return {"ok": True, "backend": svc.backend_name}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
