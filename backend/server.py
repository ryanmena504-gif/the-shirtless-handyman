from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Depends, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import base64
import asyncio
import uuid
import math
from pathlib import Path
from typing import List
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from auth import hash_password, verify_password, create_token, decode_token, set_auth_cookie, clear_auth_cookie
from cost_estimator import estimate_cost
from models.schemas import (
    ContractorRegister, ContractorLogin, ContractorUpdate,
    LeadCreate, ProjectResponse, VoteData, AdminLogin,
)
from prompts import (
    BUDGET_MODIFIERS, PRESERVATION_PREFIX, SEAMLESS_RULE, STYLE_PROMPTS,
    ROOM_ANALYSIS_PROMPTS, PROJECT_TYPE_ROUTING,
    SHIRTLESS_HANDYMAN_ZIP, SHIRTLESS_HANDYMAN_PROFILE,
)
from notifications import notify_new_lead
from image_utils import normalize_image_for_ai

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# ==================== ZIP CODE UTILITIES ====================

ZIP_COORDINATES = {
    "10001": (40.7484, -73.9967), "10002": (40.7157, -73.9863),
    "90001": (33.9425, -118.2551), "90210": (34.0901, -118.4065),
    "94102": (37.7749, -122.4194), "94103": (37.7727, -122.4153),
    "33101": (25.7617, -80.1918), "33109": (25.7617, -80.1300),
    "60601": (41.8819, -87.6278), "60602": (41.8827, -87.6292),
    "75201": (32.7767, -96.7970), "75202": (32.7876, -96.7985),
    "30301": (33.7490, -84.3880), "30302": (33.7550, -84.3900),
    "98101": (47.6062, -122.3321), "98102": (47.6205, -122.3213),
    "02101": (42.3601, -71.0589), "02102": (42.3380, -71.0476),
    "20001": (38.9072, -77.0369), "20002": (38.9005, -76.9900),
    "70112": (29.9546, -90.0701), "70113": (29.9499, -90.0822),
    "70114": (29.9369, -90.0332), "70115": (29.9260, -90.1004),
    "70116": (29.9624, -90.0586), "70117": (29.9716, -90.0367),
    "70118": (29.9390, -90.1226), "70119": (29.9788, -90.0733),
    "70124": (30.0037, -90.1084), "70125": (29.9407, -90.1059),
    "70126": (30.0150, -89.9940), "70127": (30.0350, -89.9580),
    "70128": (30.0480, -89.9260), "70130": (29.9430, -90.0740),
    "70131": (29.8940, -90.0180), "70148": (30.0288, -90.0687),
    "70123": (29.9100, -90.0500),
}

def get_zip_coords(zip_code: str):
    if zip_code in ZIP_COORDINATES:
        return ZIP_COORDINATES[zip_code]
    prefix = zip_code[:3]
    for zc, coords in ZIP_COORDINATES.items():
        if zc[:3] == prefix:
            return (coords[0] + 0.02, coords[1] + 0.02)
    return (39.8283, -98.5795)  # Center of US


async def get_zip_coords_async(zip_code: str):
    """ZIP -> (lat, lng) with MongoDB cache + zippopotam.us fallback.

    Order of resolution:
      1) Static ZIP_COORDINATES map (instant, no I/O)
      2) MongoDB `zip_cache` collection (persistent cache of prior API responses)
      3) zippopotam.us free public API (no key) — cached for next time
      4) Static prefix-match fallback
    """
    if not zip_code or not zip_code.strip():
        return (39.8283, -98.5795)
    zip_code = zip_code.strip()[:5]
    if zip_code in ZIP_COORDINATES:
        return ZIP_COORDINATES[zip_code]

    cached = await db.zip_cache.find_one({"zip": zip_code}, {"_id": 0, "lat": 1, "lng": 1})
    if cached:
        return (cached["lat"], cached["lng"])

    try:
        import httpx
        async with httpx.AsyncClient(timeout=4) as client:
            resp = await client.get(f"https://api.zippopotam.us/us/{zip_code}")
            if resp.status_code == 200:
                payload = resp.json()
                place = (payload.get("places") or [{}])[0]
                lat = float(place.get("latitude", 0))
                lng = float(place.get("longitude", 0))
                if lat and lng:
                    await db.zip_cache.update_one(
                        {"zip": zip_code},
                        {"$set": {"zip": zip_code, "lat": lat, "lng": lng,
                                  "city": place.get("place name", ""),
                                  "state": place.get("state abbreviation", ""),
                                  "cached_at": datetime.now(timezone.utc).isoformat()}},
                        upsert=True,
                    )
                    return (lat, lng)
    except Exception as e:  # noqa: BLE001
        logger.warning(f"ZIP geocoding failed for {zip_code}: {type(e).__name__}: {e}")

    return get_zip_coords(zip_code)

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "AI Renovation Visualizer API"}


@api_router.get("/health/ai")
async def ai_health_check():
    """Quick check whether the AI image-edit pipeline is reachable from the deployed env.

    Returns ok=true if EMERGENT_LLM_KEY is configured and a tiny image_edit call succeeds.
    Use this on the deployed site to diagnose generation failures without uploading photos.
    """
    api_key = os.environ.get("EMERGENT_LLM_KEY", "")
    if not api_key:
        return {"ok": False, "stage": "config", "error": "EMERGENT_LLM_KEY is missing on this environment"}
    try:
        import litellm
        from emergentintegrations.llm.utils import get_integration_proxy_url
        proxy_url = get_integration_proxy_url() + "/llm"
        # 1x1 transparent PNG
        tiny_png = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        resp = await asyncio.to_thread(
            litellm.image_edit,
            image=tiny_png,
            prompt="make it red",
            model="openai/gpt-image-1",
            api_key=api_key,
            api_base=proxy_url,
            quality="low",
            n=1,
            timeout=45,
        )
        ok = bool(resp and resp.data)
        return {"ok": ok, "stage": "image_edit", "proxy_url": proxy_url}
    except Exception as e:  # pragma: no cover - diagnostic
        return {
            "ok": False,
            "stage": "image_edit",
            "error_type": type(e).__name__,
            "error": str(e)[:500],
        }


# --- Project Routes ---

@api_router.post("/projects/upload")
async def upload_project(
    photo: UploadFile = File(...),
    zip_code: str = Form(...),
    project_type: str = Form(...),
    budget: str = Form(...),
    primary_index: int = Form(0),
    additional_photos: List[UploadFile] = File(default=[]),
):
    raw = await photo.read()
    try:
        image_data, content_type = normalize_image_for_ai(raw)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Could not process the uploaded photo: {e}. Try a JPEG or PNG.")
    image_base64 = base64.b64encode(image_data).decode("utf-8")

    # Build list of all images (primary first, then additional)
    all_images = [f"data:{content_type};base64,{image_base64}"]
    for extra in additional_photos:
        extra_raw = await extra.read()
        try:
            extra_data, extra_ct = normalize_image_for_ai(extra_raw)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Could not process one of your additional photos: {e}")
        extra_b64 = base64.b64encode(extra_data).decode("utf-8")
        all_images.append(f"data:{extra_ct};base64,{extra_b64}")

    # Clamp primary_index
    if primary_index < 0 or primary_index >= len(all_images):
        primary_index = 0

    project_id = str(uuid.uuid4())
    project = {
        "id": project_id,
        "project_type": project_type,
        "zip_code": zip_code,
        "budget": budget,
        "original_image": all_images[primary_index],
        "additional_images": [img for i, img in enumerate(all_images) if i != primary_index],
        "status": "uploaded",
        "designs": [],
        "cost_estimate": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.projects.insert_one(project)

    return {
        "id": project_id,
        "project_type": project_type,
        "zip_code": zip_code,
        "budget": budget,
        "status": "uploaded",
        "created_at": project["created_at"],
    }


@api_router.post("/projects/{project_id}/generate")
async def generate_designs(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # If already completed, return existing results
    if project.get("status") == "completed" and len(project.get("designs", [])) > 0:
        return {"id": project_id, "status": "completed", "designs": project["designs"], "cost_estimate": project.get("cost_estimate")}

    if project.get("status") == "generating":
        return {"id": project_id, "status": "generating"}

    # Mark as generating and clear any previous error and return immediately
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"status": "generating"}, "$unset": {"error": "", "error_detail": ""}},
    )

    # Run both analysis and generation in parallel threads
    import threading
    analysis_thread = threading.Thread(target=_run_analysis_sync, args=(project_id, project), daemon=True)
    generation_thread = threading.Thread(target=_run_generation_sync, args=(project_id, project), daemon=True)
    analysis_thread.start()
    generation_thread.start()

    return {"id": project_id, "status": "generating"}


def _run_analysis_sync(project_id: str, project: dict):
    """Run analysis in a separate thread with its own event loop and DB client."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    thread_client = AsyncIOMotorClient(mongo_url)
    thread_db = thread_client[os.environ['DB_NAME']]
    try:
        _run_analysis(project_id, project, thread_db, loop)
    except Exception as e:
        logger.error(f"Analysis thread error: {e}")
        loop.run_until_complete(
            thread_db.projects.update_one(
                {"id": project_id},
                {"$set": {"analysis_status": "failed", "analysis_error": str(e)}},
            )
        )
    finally:
        thread_client.close()
        loop.close()


def _run_generation_sync(project_id: str, project: dict):
    """Run generation in a separate thread with its own event loop and DB client."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    thread_client = AsyncIOMotorClient(mongo_url)
    thread_db = thread_client[os.environ['DB_NAME']]
    try:
        _do_generation(project_id, project, thread_db, loop)
    except Exception as e:
        logger.error(f"Generation thread error: {e}")
        loop.run_until_complete(
            thread_db.projects.update_one(
                {"id": project_id},
                {"$set": {"status": "failed", "error": str(e)}},
            )
        )
    finally:
        thread_client.close()
        loop.close()


def _extract_image_bytes(image_data_uri):
    """Extract raw bytes from a data URI image."""
    if not image_data_uri.startswith("data:"):
        return None
    b64_part = image_data_uri.split(",", 1)[1]
    return base64.b64decode(b64_part)


def _generate_single_design(style, image_bytes, budget_mod, preservation_suffix, api_key, proxy_url):
    """Generate a single design variant using the AI image editor. Returns dict or None."""
    import litellm

    full_prompt = f"{style['prompt']} {budget_mod['materials']}, {budget_mod['features']}, {budget_mod['style']}.{preservation_suffix}"

    response = litellm.image_edit(
        image=image_bytes,
        prompt=full_prompt,
        model="openai/gpt-image-1",
        api_key=api_key,
        api_base=proxy_url,
        quality="low",
        n=1,
        timeout=180,
    )
    if not response or not response.data:
        return None

    img = response.data[0]
    if hasattr(img, 'b64_json') and img.b64_json:
        return {"name": style["name"], "image": f"data:image/png;base64,{img.b64_json}"}
    if hasattr(img, 'url') and img.url:
        import requests as req
        img_response = req.get(img.url, timeout=30)
        return {"name": style["name"], "image": f"data:image/png;base64,{base64.b64encode(img_response.content).decode('utf-8')}"}
    return None


def _do_generation(project_id: str, project: dict, thread_db, loop):
    from emergentintegrations.llm.utils import get_integration_proxy_url

    project_type = project["project_type"]
    budget = project.get("budget", "10k_20k")
    styles = STYLE_PROMPTS.get(project_type, STYLE_PROMPTS["Bathroom"])
    budget_mod = BUDGET_MODIFIERS.get(budget, BUDGET_MODIFIERS["10k_20k"])

    image_bytes = _extract_image_bytes(project.get("original_image", ""))
    if not image_bytes:
        loop.run_until_complete(
            thread_db.projects.update_one(
                {"id": project_id},
                {"$set": {"status": "failed", "error": "No original image found"}},
            )
        )
        return

    api_key = os.environ.get("EMERGENT_LLM_KEY", "")
    if not api_key:
        loop.run_until_complete(
            thread_db.projects.update_one(
                {"id": project_id},
                {"$set": {"status": "failed", "error": "AI service is not configured. Please contact support."}},
            )
        )
        logger.error(f"EMERGENT_LLM_KEY missing for project {project_id}")
        return

    proxy_url = get_integration_proxy_url() + "/llm"
    preservation_suffix = " IMPORTANT: This must look like the SAME room after renovation. Preserve the exact camera angle, room shape, wall positions, door locations, and window placements from the original photo. Only change materials, finishes, fixtures, and decor."

    designs = []
    last_error = None
    for style in styles:
        try:
            result = _generate_single_design(style, image_bytes, budget_mod, preservation_suffix, api_key, proxy_url)
            if result:
                designs.append(result)
            logger.info(f"Generated: {style['name']} for project {project_id} (budget: {budget})")
        except Exception as e:
            last_error = e
            logger.error(f"Image edit error for {style['name']}: {type(e).__name__}: {e}")

    cost = estimate_cost(project_type, project["zip_code"])
    status = "completed" if designs else "failed"
    update_fields = {"designs": designs, "cost_estimate": cost, "status": status}
    if status == "failed" and last_error is not None:
        update_fields["error"] = _friendly_generation_error(last_error)
        update_fields["error_detail"] = f"{type(last_error).__name__}: {str(last_error)[:500]}"
    loop.run_until_complete(
        thread_db.projects.update_one(
            {"id": project_id},
            {"$set": update_fields},
        )
    )
    logger.info(f"Generation complete for {project_id}: {len(designs)} designs (status={status})")


# Ordered list of (keywords, message) tuples for mapping LLM errors → user-friendly messages.
# Each row is checked in order; first match wins.
_GENERATION_ERROR_PATTERNS = (
    (("budget", "insufficient", "balance", "credit"),
     "AI generation budget exceeded. Please add balance at Profile > Universal Key > Add Balance."),
    (("401", "403", "unauthorized", "forbidden", "invalid api key", "authentication"),
     "AI service authentication failed. The Universal LLM Key may be missing or expired on the deployed environment."),
    (("timeout", "timed out", "504", "deadline"),
     "AI generation timed out. Please try again with a smaller photo."),
    (("rate limit", "429", "too many requests"),
     "AI service is busy right now. Please wait a moment and try again."),
    (("content policy", "safety", "moderation", "rejected"),
     "The AI couldn't process this photo due to content guidelines. Try a different room photo."),
    (("connection",),
     "Couldn't reach the AI service. Please try again in a moment."),
)
_CONNECTION_ERROR_NAMES = {"ConnectionError", "ConnectError"}
_GENERIC_GENERATION_ERROR = "Design generation failed. Please try again."


def _friendly_generation_error(exc: Exception) -> str:
    """Map low-level exceptions to user-friendly messages."""
    msg = str(exc).lower()
    for keywords, friendly in _GENERATION_ERROR_PATTERNS:
        if any(k in msg for k in keywords):
            return friendly
    if type(exc).__name__ in _CONNECTION_ERROR_NAMES:
        return "Couldn't reach the AI service. Please try again in a moment."
    return _GENERIC_GENERATION_ERROR


# --- Room Analysis with AI Vision ---

def _build_analysis_prompt(project_type, additional_images):
    """Build the analysis prompt with multi-photo context if applicable."""
    analysis_prompt = ROOM_ANALYSIS_PROMPTS.get(project_type, ROOM_ANALYSIS_PROMPTS["default"])
    multi_photo_note = ""
    if additional_images:
        num_photos = 1 + len(additional_images)
        multi_photo_note = f"\n\nYou are provided {num_photos} photos of the same room from different angles. Use ALL photos to form a comprehensive assessment. The first image is the primary angle."
    
    return f"""{analysis_prompt}{multi_photo_note}

After your analysis, format your response EXACTLY as JSON with this structure:
{{
    "detected_conditions": [
        {{"category": "Surface Wear", "severity": "moderate|minor|significant", "description": "specific observation"}},
        {{"category": "Outdated Materials", "severity": "moderate|minor|significant", "description": "specific observation"}},
        ...more conditions
    ],
    "recommended_fixes": [
        {{"priority": "high|medium|low", "fix": "specific recommendation", "reason": "why this is needed"}},
        ...more fixes
    ],
    "cost_impact": {{
        "basic_repair": {{"low": 0, "high": 0, "description": "what's included"}},
        "mid_level_renovation": {{"low": 0, "high": 0, "description": "what's included"}},
        "full_upgrade": {{"low": 0, "high": 0, "description": "what's included"}}
    }},
    "overall_assessment": "2-3 sentence professional summary of the room's condition and renovation potential"
}}

Provide realistic cost estimates in USD based on typical {project_type.lower()} renovation costs."""


def _build_vision_content(prompt, original_image, additional_images):
    """Build the vision API content array with text and image parts."""
    parts = [{"type": "text", "text": prompt}]
    parts.append({"type": "image_url", "image_url": {"url": original_image}})
    for extra_img in additional_images:
        if extra_img.startswith("data:"):
            parts.append({"type": "image_url", "image_url": {"url": extra_img}})
    return parts


def _parse_analysis_response(analysis_text):
    """Parse JSON from AI analysis response, with fallback."""
    import json
    import re
    json_match = re.search(r'\{[\s\S]*\}', analysis_text)
    if json_match:
        return json.loads(json_match.group())
    return {
        "detected_conditions": [
            {"category": "General Assessment", "severity": "moderate", "description": analysis_text[:500]}
        ],
        "recommended_fixes": [
            {"priority": "medium", "fix": "Professional inspection recommended", "reason": "Detailed analysis needed"}
        ],
        "cost_impact": {
            "basic_repair": {"low": 1000, "high": 3000, "description": "Minor repairs and touch-ups"},
            "mid_level_renovation": {"low": 5000, "high": 15000, "description": "Moderate updates"},
            "full_upgrade": {"low": 15000, "high": 40000, "description": "Complete renovation"}
        },
        "overall_assessment": "A professional on-site inspection is recommended for detailed assessment."
    }


def _run_analysis(project_id: str, project: dict, thread_db, loop):
    """Run AI-powered room analysis in background thread."""
    import litellm
    from emergentintegrations.llm.utils import get_integration_proxy_url

    original_image_data = project.get("original_image", "")
    if not original_image_data.startswith("data:"):
        loop.run_until_complete(
            thread_db.projects.update_one(
                {"id": project_id},
                {"$set": {"analysis_status": "failed", "analysis_error": "No image found"}},
            )
        )
        return

    additional_images = project.get("additional_images", [])
    api_key = os.environ.get("EMERGENT_LLM_KEY", "")
    proxy_url = get_integration_proxy_url() + "/llm"

    full_prompt = _build_analysis_prompt(project["project_type"], additional_images)
    content_parts = _build_vision_content(full_prompt, original_image_data, additional_images)

    try:
        response = litellm.completion(
            model="openai/gpt-4o",
            api_key=api_key,
            api_base=proxy_url,
            messages=[{"role": "user", "content": content_parts}],
            max_tokens=2000,
            timeout=60,
        )
        analysis_data = _parse_analysis_response(response.choices[0].message.content)
        loop.run_until_complete(
            thread_db.projects.update_one(
                {"id": project_id},
                {"$set": {"analysis": analysis_data, "analysis_status": "completed"}},
            )
        )
        logger.info(f"Analysis complete for {project_id}")
    except Exception as e:
        logger.error(f"Analysis error for {project_id}: {e}")
        loop.run_until_complete(
            thread_db.projects.update_one(
                {"id": project_id},
                {"$set": {"analysis_status": "failed", "analysis_error": str(e)}},
            )
        )


@api_router.get("/projects/{project_id}")
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# --- Share Routes ---

@api_router.post("/shares")
async def create_share(project_id: str = Form(...)):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project or project.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Project not ready for sharing")

    # Check if share already exists for this project
    existing = await db.shares.find_one({"project_id": project_id}, {"_id": 0})
    if existing:
        return {"share_id": existing["id"], "project_id": project_id}

    share_id = str(uuid.uuid4())[:8]
    share = {
        "id": share_id,
        "project_id": project_id,
        "original_image": project.get("original_image", ""),
        "designs": [{"name": d["name"], "image": d["image"], "votes": 0} for d in project.get("designs", [])],
        "project_type": project.get("project_type", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.shares.insert_one(share)
    return {"share_id": share_id, "project_id": project_id}


@api_router.get("/shares/{share_id}")
async def get_share(share_id: str):
    share = await db.shares.find_one({"id": share_id}, {"_id": 0})
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")
    return share


@api_router.post("/shares/{share_id}/vote")
async def vote_design(share_id: str, data: VoteData):
    share = await db.shares.find_one({"id": share_id}, {"_id": 0})
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")
    if data.design_index < 0 or data.design_index >= len(share.get("designs", [])):
        raise HTTPException(status_code=400, detail="Invalid design index")

    await db.shares.update_one(
        {"id": share_id},
        {"$inc": {f"designs.{data.design_index}.votes": 1}},
    )
    updated = await db.shares.find_one({"id": share_id}, {"_id": 0})
    return {"votes": [d["votes"] for d in updated["designs"]]}

@api_router.post("/contractors/register")
async def register_contractor(data: ContractorRegister):
    existing = await db.contractors.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    contractor_id = str(uuid.uuid4())
    contractor = {
        "id": contractor_id,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "company_name": data.company_name,
        "specialties": data.specialties,
        "service_zip_codes": data.service_zip_codes,
        "phone": data.phone,
        "description": data.description,
        "photos": [],
        "latitude": data.latitude,
        "longitude": data.longitude,
        "rating": 0.0,
        "review_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.contractors.insert_one(contractor)

    token = create_token(contractor_id)
    response = JSONResponse(content={
        "token": token,
        "contractor": {
            "id": contractor_id,
            "email": data.email,
            "company_name": data.company_name,
        },
    })
    set_auth_cookie(response, token)
    return response


@api_router.post("/contractors/login")
async def login_contractor(data: ContractorLogin):
    contractor = await db.contractors.find_one({"email": data.email}, {"_id": 0})
    if not contractor or not verify_password(data.password, contractor["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(contractor["id"])
    response = JSONResponse(content={
        "token": token,
        "contractor": {
            "id": contractor["id"],
            "email": contractor["email"],
            "company_name": contractor["company_name"],
        },
    })
    set_auth_cookie(response, token)
    return response


@api_router.get("/contractors/me")
async def get_my_profile(contractor_id: str = Depends(decode_token)):
    contractor = await db.contractors.find_one({"id": contractor_id}, {"_id": 0, "password_hash": 0})
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    return contractor


@api_router.post("/auth/logout")
async def logout():
    response = JSONResponse(content={"message": "Logged out"})
    clear_auth_cookie(response)
    return response


@api_router.put("/contractors/me")
async def update_my_profile(data: ContractorUpdate, contractor_id: str = Depends(decode_token)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    await db.contractors.update_one({"id": contractor_id}, {"$set": update_data})
    contractor = await db.contractors.find_one({"id": contractor_id}, {"_id": 0, "password_hash": 0})
    return contractor


def _calc_distance_miles(lat1, lng1, lat2, lng2):
    """Calculate distance in miles between two coordinates using Haversine formula."""
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return round(2 * math.asin(math.sqrt(a)) * 3956, 1)


def _get_priority_score(contractor, priority_specialties):
    """Lower score = higher priority. Matches company name first, then specialties."""
    specialties = contractor.get("specialties", [])
    company_name = contractor.get("company_name", "").lower()
    for idx, priority in enumerate(priority_specialties):
        priority_lower = priority.lower()
        if priority_lower in company_name:
            return idx * 10
        for spec in specialties:
            if priority_lower in spec.lower() or spec.lower() in priority_lower:
                return (idx + 1) * 10 + 5
    return 1000 + contractor.get("distance_miles", 999)


def _enrich_contractor_distances(contractors, user_coords):
    """Add distance_miles to each contractor based on user coordinates."""
    for c in contractors:
        clat, clng = c.get("latitude", 0), c.get("longitude", 0)
        if clat and clng:
            c["distance_miles"] = _calc_distance_miles(user_coords[0], user_coords[1], clat, clng)
        else:
            c["distance_miles"] = 0


def _sort_contractors(contractors, project_type):
    """Sort contractors by specialty routing or distance."""
    if project_type and project_type in PROJECT_TYPE_ROUTING:
        priority_specialties = PROJECT_TYPE_ROUTING[project_type]
        contractors.sort(key=lambda x: (_get_priority_score(x, priority_specialties), x.get("distance_miles", 999)))
    else:
        contractors.sort(key=lambda x: x.get("distance_miles", 999))


@api_router.get("/contractors/search")
async def search_contractors(zip_code: str, project_type: str = ""):
    projection = {"_id": 0, "password_hash": 0}
    query = {"service_zip_codes": {"$in": [zip_code, zip_code[:3]]}}
    contractors = await db.contractors.find(query, projection).to_list(50)

    if not contractors:
        contractors = await db.contractors.find({}, projection).to_list(20)

    user_coords = await get_zip_coords_async(zip_code)
    _enrich_contractor_distances(contractors, user_coords)
    _sort_contractors(contractors, project_type)

    # Easter egg: Shirtless Handyman for ZIP 70123
    if zip_code == SHIRTLESS_HANDYMAN_ZIP:
        contractors.insert(0, dict(SHIRTLESS_HANDYMAN_PROFILE))

    # Mark the top contractor as suggested
    if contractors:
        contractors[0]["is_suggested"] = True
    
    return {"contractors": contractors, "user_location": {"lat": user_coords[0], "lng": user_coords[1]}}


@api_router.get("/contractors/{contractor_id}")
async def get_contractor_public(contractor_id: str):
    contractor = await db.contractors.find_one({"id": contractor_id}, {"_id": 0, "password_hash": 0})
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    return contractor


# --- Lead Routes ---

@api_router.post("/leads")
async def create_lead(data: LeadCreate):
    lead_id = str(uuid.uuid4())
    lead = {
        "id": lead_id,
        **data.model_dump(),
        "source": "quote_form",
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.leads.insert_one(lead)
    # Fire notifications in background — never block the lead submission.
    lead_clean = {k: v for k, v in lead.items() if k != "_id"}
    asyncio.create_task(notify_new_lead(lead_clean))
    asyncio.create_task(followup_service.schedule_followups(db, lead_clean))
    return {"id": lead_id, "status": "new", "message": "Quote request submitted successfully"}


class QuickLead(BaseModel):
    name: str
    phone: str = ""
    email: str = ""
    zip_code: str = ""
    project_type: str = ""
    source: str = "hero_form"


@api_router.post("/leads/quick")
async def create_quick_lead(data: QuickLead):
    """Lightweight lead capture for hero form / exit-intent modal / sticky CTA /
    Studio email-gate. Requires name + (phone OR email)."""
    if not data.name.strip() or (not data.phone.strip() and not data.email.strip()):
        raise HTTPException(status_code=400, detail="Name and either phone or email are required")
    lead_id = str(uuid.uuid4())
    lead = {
        "id": lead_id,
        "name": data.name.strip(),
        "phone": data.phone.strip(),
        "email": data.email.strip(),
        "zip_code": data.zip_code.strip(),
        "project_type": data.project_type.strip(),
        "project_description": "",
        "selected_design_style": "",
        "room_photo": "",
        "project_id": None,
        "contractor_id": None,
        "source": data.source or "hero_form",
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.leads.insert_one(lead)
    lead_clean = {k: v for k, v in lead.items() if k != "_id"}
    asyncio.create_task(notify_new_lead(lead_clean))
    asyncio.create_task(followup_service.schedule_followups(db, lead_clean))
    return {"id": lead_id, "status": "new", "message": "Got it — Ryan will reach out within 1 hour."}


# =========================================================================
# AI Chat Bot — Claude Sonnet via Emergent Universal Key
# =========================================================================
from chat_service import (
    make_chat,
    replay_history,
    extract_contact,
    build_chat_message_doc,
    UserMessage,
)


class ChatRequest(BaseModel):
    session_id: str
    message: str
    name: str = ""  # optional — if the visitor has shared their name elsewhere


@api_router.post("/chat")
async def chat_endpoint(req: ChatRequest):
    """Send a user message to the AI assistant. Multi-turn — conversation
    history is persisted in MongoDB keyed by session_id."""
    session_id = (req.session_id or "").strip()
    user_text = (req.message or "").strip()
    if not session_id or not user_text:
        raise HTTPException(status_code=400, detail="session_id and message are required")
    if len(user_text) > 2000:
        raise HTTPException(status_code=400, detail="Message too long (2000 char max)")

    # Restore prior turns
    cursor = db.chat_messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1)
    history = await cursor.to_list(50)

    try:
        chat = make_chat(session_id)
        await replay_history(chat, history)
        reply = await chat.send_message(UserMessage(text=user_text))
    except Exception as e:
        logger.exception(f"Chat error for session {session_id}: {e}")
        raise HTTPException(
            status_code=502,
            detail="The AI is napping right now — text Ryan directly at 504-264-4919.",
        )

    # Persist this turn
    await db.chat_messages.insert_one(build_chat_message_doc(session_id, "user", user_text))
    await db.chat_messages.insert_one(build_chat_message_doc(session_id, "assistant", reply))

    # If the user dropped contact info in their message, save them as a lead.
    contact = extract_contact(user_text)
    lead_id = None
    if contact["phone"] or contact["email"]:
        # Use the name from the request if provided, otherwise try to derive from
        # the first user turn that looked like an introduction.
        name = (req.name or "").strip() or "Chat visitor"
        lead_doc = {
            "id": str(uuid.uuid4()),
            "name": name,
            "phone": contact["phone"],
            "email": contact["email"],
            "zip_code": "",
            "project_type": "",
            "project_description": user_text[:280],
            "selected_design_style": "",
            "room_photo": "",
            "project_id": None,
            "contractor_id": None,
            "source": "ai_chat",
            "status": "new",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.leads.insert_one(lead_doc)
        lead_id = lead_doc["id"]
        lead_clean_chat = {k: v for k, v in lead_doc.items() if k != "_id"}
        asyncio.create_task(notify_new_lead(lead_clean_chat))
        asyncio.create_task(followup_service.schedule_followups(db, lead_clean_chat))

    return {"reply": reply, "lead_id": lead_id}


@api_router.get("/chat/{session_id}/history")
async def get_chat_history(session_id: str):
    """Return prior messages for a session so the widget can rehydrate after refresh."""
    msgs = await db.chat_messages.find(
        {"session_id": session_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(50)
    return {"messages": msgs}


# =========================================================================
# Chat Booking — visitor picks a day + time slot, Ryan gets a confirmed SMS
# =========================================================================
import followup_service
import google_reviews
from fastapi.responses import HTMLResponse


class BookingRequest(BaseModel):
    name: str
    phone: str
    email: str = ""
    preferred_date: str  # ISO date "2026-03-10"
    preferred_time: str  # "morning" | "afternoon" | "evening" | "10:00" etc
    project_type: str = ""
    notes: str = ""
    zip_code: str = ""
    session_id: str = ""


@api_router.post("/bookings")
async def create_booking(data: BookingRequest):
    """Visitor books a callback/consult slot from the chat widget.
    Stores the booking, texts Ryan, and emails the customer a confirmation."""
    name = (data.name or "").strip()
    phone = (data.phone or "").strip()
    pref_date = (data.preferred_date or "").strip()
    pref_time = (data.preferred_time or "").strip()
    if not name or not phone or not pref_date or not pref_time:
        raise HTTPException(status_code=400, detail="Name, phone, date, and time are required")

    booking = {
        "id": str(uuid.uuid4()),
        "name": name,
        "phone": phone,
        "email": (data.email or "").strip(),
        "preferred_date": pref_date,
        "preferred_time": pref_time,
        "project_type": (data.project_type or "").strip(),
        "notes": (data.notes or "").strip()[:500],
        "zip_code": (data.zip_code or "").strip(),
        "session_id": (data.session_id or "").strip(),
        "status": "confirmed",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.bookings.insert_one(booking)

    # Also persist as a lead so it flows through the normal lead pipeline + follow-ups.
    lead_doc = {
        "id": str(uuid.uuid4()),
        "name": name,
        "phone": phone,
        "email": booking["email"],
        "zip_code": booking["zip_code"],
        "project_type": booking["project_type"] or "Booked consultation",
        "project_description": f"📅 BOOKED: {pref_date} {pref_time} — {booking['notes']}".strip(),
        "selected_design_style": "",
        "room_photo": "",
        "project_id": None,
        "contractor_id": None,
        "source": "chat_booking",
        "status": "new",
        "booking_id": booking["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.leads.insert_one(lead_doc)

    # Send Ryan an SMS that's clearly a booking (not just a generic lead)
    from notifications import send_lead_email, send_lead_sms, send_homeowner_autoreply

    async def _send_booking_sms():
        sid = os.environ.get("TWILIO_ACCOUNT_SID", "").strip()
        token = os.environ.get("TWILIO_AUTH_TOKEN", "").strip()
        from_num = os.environ.get("TWILIO_FROM_NUMBER", "").strip()
        to_num = os.environ.get("LEAD_NOTIFICATION_PHONE", "").strip()
        if not (sid and token and from_num and to_num):
            return False
        try:
            from twilio.rest import Client
            client_t = Client(sid, token)
            body = (
                f"✅ NEW BOOKING: {name} · {phone} · {pref_date} {pref_time} · "
                f"ZIP {booking['zip_code'] or '?'} · {booking['project_type'] or 'consult'}"
            )
            await asyncio.to_thread(
                lambda: client_t.messages.create(body=body, from_=from_num, to=to_num)
            )
            return True
        except Exception as e:  # noqa: BLE001
            logger.error(f"Booking SMS failed: {e}")
            return False

    async def _send_customer_confirmation():
        api_key = os.environ.get("RESEND_API_KEY", "").strip()
        from_email = os.environ.get("RESEND_FROM_EMAIL", "onboarding@resend.dev").strip()
        if not api_key or not booking["email"] or "@" not in booking["email"]:
            return False
        try:
            import resend
            resend.api_key = api_key
            first = name.split()[0][:30]
            time_label = pref_time
            html = f"""<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;background:#FAFAF9;padding:24px;margin:0;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
<tr><td style="background:#0E0E0E;padding:30px 32px;color:#fff;">
<p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#D97757;font-weight:bold;">Booking Confirmed</p>
<h1 style="margin:10px 0 0 0;font-size:28px;font-weight:300;color:#fff;font-family:Georgia,serif;">You're on the calendar, {first}.</h1>
</td></tr>
<tr><td style="padding:30px 32px;font-size:15px;color:#1F2A28;line-height:1.6;">
<p style="margin:0 0 16px 0;">Ryan got your booking. Here's what's locked in:</p>
<div style="background:#FAF7F2;border-radius:12px;padding:18px 22px;margin:16px 0;">
<p style="margin:0 0 4px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#666;font-weight:bold;">When</p>
<p style="margin:0 0 12px 0;font-size:18px;font-weight:600;color:#1F2A28;">{pref_date} · {time_label}</p>
<p style="margin:0 0 4px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#666;font-weight:bold;">Project</p>
<p style="margin:0;font-size:15px;color:#1F2A28;">{booking['project_type'] or 'Free consultation'}</p>
</div>
<p style="margin:14px 0;font-size:14px;color:#555;">Ryan will text you 10–15 min before to confirm. If anything changes, just text 504-264-4919.</p>
<p style="margin:24px 0 0 0;font-size:12px;color:#999;">— Ryan Mena · The Shirtless Handyman</p>
</td></tr></table></body></html>"""
            await asyncio.to_thread(resend.Emails.send, {
                "from": from_email,
                "to": [booking["email"]],
                "subject": f"Booking confirmed for {pref_date} — The Shirtless Handyman",
                "html": html,
            })
            return True
        except Exception as e:  # noqa: BLE001
            logger.error(f"Booking confirmation email failed: {e}")
            return False

    async def _all_booking_notifs():
        await asyncio.gather(
            _send_booking_sms(),
            send_lead_email({k: v for k, v in lead_doc.items() if k != "_id"}),
            send_homeowner_autoreply({k: v for k, v in lead_doc.items() if k != "_id"}),
            _send_customer_confirmation(),
            followup_service.schedule_followups(db, {k: v for k, v in lead_doc.items() if k != "_id"}),
            return_exceptions=True,
        )
    asyncio.create_task(_all_booking_notifs())

    return {
        "id": booking["id"],
        "status": "confirmed",
        "message": f"You're booked for {pref_date} {pref_time}. Ryan will confirm via text.",
    }


# =========================================================================
# Google Reviews — proxied + cached via Place ID
# =========================================================================

@api_router.get("/google-reviews")
async def google_reviews_endpoint():
    """Return cached Google Reviews for the business Place ID set in env.
    Returns an empty {reviews:[]} if the API key isn't configured yet."""
    place_id = os.environ.get("GOOGLE_PLACES_PLACE_ID", "").strip()
    return await google_reviews.get_reviews(db, place_id)


# =========================================================================
# Email follow-up — unsubscribe link (rendered as a small HTML page)
# =========================================================================

@api_router.get("/followups/unsubscribe/{token}", response_class=HTMLResponse)
async def unsubscribe_followups(token: str):
    email = await followup_service.unsubscribe_by_token(db, token)
    if not email:
        return HTMLResponse(
            "<html><body style='font-family:sans-serif;padding:40px;'>"
            "<h2>Link not found</h2><p>This unsubscribe link is invalid or expired.</p>"
            "</body></html>",
            status_code=404,
        )
    return HTMLResponse(
        f"<html><body style='font-family:-apple-system,sans-serif;background:#FAFAF9;padding:60px 24px;text-align:center;color:#1F2A28;'>"
        f"<div style='max-width:480px;margin:0 auto;background:#fff;padding:48px 36px;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);'>"
        f"<h1 style='margin:0 0 12px 0;font-family:Georgia,serif;font-weight:300;'>You're unsubscribed.</h1>"
        f"<p style='margin:0;color:#666;'>We won't send <strong>{email}</strong> any more follow-up emails.</p>"
        f"<p style='margin:24px 0 0 0;font-size:13px;color:#999;'>If you need to reach Ryan directly: 504-264-4919</p>"
        f"</div></body></html>"
    )


@api_router.get("/leads")
async def get_leads(contractor_id: str = Depends(decode_token)):
    lead_projection = {"_id": 0}
    leads = await db.leads.find(
        {"contractor_id": contractor_id}, lead_projection
    ).sort("created_at", -1).to_list(100)
    return {"leads": leads}


@api_router.get("/leads/all")
async def get_all_leads(contractor_id: str = Depends(decode_token)):
    # Get contractor's service area
    contractor = await db.contractors.find_one({"id": contractor_id}, {"_id": 0})
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")

    zip_codes = contractor.get("service_zip_codes", [])
    query = {}
    if zip_codes:
        query = {"zip_code": {"$in": zip_codes}}
    lead_projection = {"_id": 0}
    leads = await db.leads.find(query, lead_projection).sort("created_at", -1).to_list(100)
    return {"leads": leads}


class LeadStatusUpdate(BaseModel):
    status: str  # "new" | "contacted" | "closed"


@api_router.patch("/leads/{lead_id}/status")
async def update_lead_status(lead_id: str, data: LeadStatusUpdate, principal_id: str = Depends(decode_token)):
    """Contractor or admin updates a lead status. Used by the contractor mobile inbox."""
    allowed = {"new", "contacted", "closed"}
    if data.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of {sorted(allowed)}")

    # Build authorization filter: admin can update any lead, contractor only their own.
    if principal_id == "admin":
        filter_q = {"id": lead_id}
    else:
        # Contractor can update leads either explicitly assigned to them or in their ZIPs.
        contractor = await db.contractors.find_one({"id": principal_id}, {"_id": 0, "service_zip_codes": 1})
        if not contractor:
            raise HTTPException(status_code=403, detail="Not authorized")
        filter_q = {
            "id": lead_id,
            "$or": [
                {"contractor_id": principal_id},
                {"zip_code": {"$in": contractor.get("service_zip_codes", [])}},
            ],
        }

    result = await db.leads.update_one(
        filter_q,
        {"$set": {"status": data.status, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found or not accessible")
    return {"id": lead_id, "status": data.status}


# --- Admin Routes ---

@api_router.post("/admin/login")
async def admin_login(data: AdminLogin):
    admin_pw = os.environ.get("ADMIN_PASSWORD", "")
    if not admin_pw or data.password != admin_pw:
        raise HTTPException(status_code=401, detail="Invalid admin password")
    token = create_token("admin")
    response = JSONResponse(content={"token": token, "role": "admin"})
    set_auth_cookie(response, token)
    return response

@api_router.get("/admin/leads")
async def admin_get_all_leads(admin_id: str = Depends(decode_token)):
    if admin_id != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    lead_projection = {"_id": 0}
    leads = await db.leads.find({}, lead_projection).sort("created_at", -1).to_list(500)
    # Batch-fetch contractor names in a single query (avoids N+1).
    contractor_ids = list({lead.get("contractor_id") for lead in leads if lead.get("contractor_id")})
    contractors_map = {}
    if contractor_ids:
        contractors = await db.contractors.find(
            {"id": {"$in": contractor_ids}},
            {"_id": 0, "id": 1, "company_name": 1},
        ).to_list(len(contractor_ids))
        contractors_map = {c["id"]: c["company_name"] for c in contractors}
    for lead in leads:
        cid = lead.get("contractor_id")
        if cid:
            lead["contractor_name"] = contractors_map.get(cid, "Unknown")
    return {"leads": leads, "total": len(leads)}

@api_router.get("/admin/contractors")
async def admin_get_all_contractors(admin_id: str = Depends(decode_token)):
    if admin_id != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    contractors = await db.contractors.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(100)
    return {"contractors": contractors, "total": len(contractors)}

@api_router.get("/admin/stats")
async def admin_get_stats(admin_id: str = Depends(decode_token)):
    if admin_id != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    total_leads = await db.leads.count_documents({})
    new_leads = await db.leads.count_documents({"status": "new"})
    total_contractors = await db.contractors.count_documents({})
    total_projects = await db.projects.count_documents({})
    completed_projects = await db.projects.count_documents({"status": "completed"})
    total_portfolio = await db.portfolio.count_documents({})
    return {
        "total_leads": total_leads,
        "new_leads": new_leads,
        "total_contractors": total_contractors,
        "total_projects": total_projects,
        "completed_projects": completed_projects,
        "total_portfolio": total_portfolio,
    }


# --- Portfolio Routes ---

@api_router.post("/admin/portfolio")
async def admin_upload_portfolio(
    admin_id: str = Depends(decode_token),
    before_photo: UploadFile = File(...),
    after_photo: UploadFile = File(...),
    title: str = Form(""),
    description: str = Form(""),
    room_type: str = Form(""),
):
    if admin_id != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    before_raw = await before_photo.read()
    try:
        before_data, before_ct = normalize_image_for_ai(before_raw)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Before photo: {e}")
    before_b64 = base64.b64encode(before_data).decode("utf-8")

    after_raw = await after_photo.read()
    try:
        after_data, after_ct = normalize_image_for_ai(after_raw)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"After photo: {e}")
    after_b64 = base64.b64encode(after_data).decode("utf-8")

    item_id = str(uuid.uuid4())
    item = {
        "id": item_id,
        "title": title or "Renovation Project",
        "description": description,
        "room_type": room_type,
        "before_image": f"data:{before_ct};base64,{before_b64}",
        "after_image": f"data:{after_ct};base64,{after_b64}",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.portfolio.insert_one(item)
    return {"id": item_id, "message": "Portfolio item added"}


@api_router.get("/admin/portfolio")
async def admin_get_portfolio(admin_id: str = Depends(decode_token)):
    if admin_id != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    items = await db.portfolio.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"items": items, "total": len(items)}


@api_router.delete("/admin/portfolio/{item_id}")
async def admin_delete_portfolio(item_id: str, admin_id: str = Depends(decode_token)):
    if admin_id != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.portfolio.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    return {"message": "Portfolio item deleted"}


@api_router.get("/portfolio")
async def get_public_portfolio():
    items = await db.portfolio.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return {"items": items}


# --- Seed Data ---

def _build_contractor(cfg):
    """Build a contractor seed document from a config dict."""
    return {
        "id": str(uuid.uuid4()),
        "email": cfg["email"],
        "password_hash": hash_password("password123"),
        "company_name": cfg["company_name"],
        "specialties": cfg["specialties"],
        "service_zip_codes": cfg["service_zips"],
        "phone": cfg["phone"],
        "description": cfg["description"],
        "photos": [],
        "latitude": cfg["lat"],
        "longitude": cfg["lng"],
        "rating": cfg["rating"],
        "review_count": cfg["reviews"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


def _get_seed_contractors():
    """Return the list of seed contractor documents."""
    nola_zips = ["701", "700", "70112", "70113", "70114", "70115", "70116", "70117", "70118", "70119", "70130"]
    configs = [
        {"email": "info@seamlessbathrooms.com", "company_name": "Seamless Bathrooms LLC", "specialties": ["Seamless Bathrooms", "Microcement", "Bathroom", "Shower", "Tile"], "service_zips": nola_zips + ["70124", "70125"], "phone": "(504) 555-0001", "description": "New Orleans' premier seamless bathroom specialists. We transform bathrooms with microcement, luxury tile, and modern spa designs. Grout-free, waterproof, stunning results.", "lat": 29.9546, "lng": -90.0701, "rating": 4.9, "reviews": 247},
        {"email": "info@crescentcityreno.com", "company_name": "Crescent City General Contractors", "specialties": ["General Contractor", "Kitchen", "Remodeling", "Bathroom"], "service_zips": nola_zips, "phone": "(504) 555-0101", "description": "Full-service general contracting for kitchen remodels, additions, and whole-home renovations. Licensed and insured in Louisiana.", "lat": 29.9520, "lng": -90.0750, "rating": 4.8, "reviews": 184},
        {"email": "info@nolaepoxypros.com", "company_name": "NOLA Epoxy Pros", "specialties": ["Epoxy Flooring", "Garage", "Concrete", "Industrial Flooring"], "service_zips": ["701", "700", "70112", "70113", "70114", "70115", "70124", "70125", "70126", "70131"], "phone": "(504) 555-0202", "description": "Professional epoxy floor coatings for garages, workshops, and commercial spaces. Metallic finishes, chip systems, and industrial-grade solutions.", "lat": 29.9369, "lng": -90.0332, "rating": 4.7, "reviews": 112},
        {"email": "info@bigeasylandscaping.com", "company_name": "Big Easy Landscaping & Hardscape", "specialties": ["Landscaping", "Hardscape", "Concrete", "Patio", "Outdoor"], "service_zips": ["701", "700", "70116", "70117", "70118", "70119", "70124", "70127", "70128"], "phone": "(504) 555-0303", "description": "Complete outdoor living transformations - patios, pool decks, outdoor kitchens, landscaping, and decorative concrete. Built for New Orleans climate.", "lat": 29.9624, "lng": -90.0586, "rating": 4.6, "reviews": 156},
        {"email": "info@gardendistrict.com", "company_name": "Garden District Pool & Patio", "specialties": ["Pool", "Concrete", "Landscaping", "Outdoor", "Pool Deck"], "service_zips": ["701", "700", "70115", "70118", "70125", "70130", "70113"], "phone": "(504) 555-0404", "description": "Luxury pool decks, patios, and outdoor living spaces in the Garden District and Uptown. Travertine, pavers, and custom concrete designs.", "lat": 29.9260, "lng": -90.1004, "rating": 4.8, "reviews": 143},
        {"email": "info@bayouremodelingco.com", "company_name": "Bayou Remodeling Co.", "specialties": ["General Contractor", "Kitchen", "Bathroom", "Remodeling"], "service_zips": ["701", "700", "70112", "70114", "70126", "70127", "70128", "70131", "70148"], "phone": "(504) 555-0505", "description": "From Lakeview to the Westbank, quality kitchen and bath remodels across Greater New Orleans. 20+ years experience.", "lat": 30.0037, "lng": -90.1084, "rating": 4.5, "reviews": 98},
    ]
    return [_build_contractor(c) for c in configs]


async def seed_data():
    count = await db.contractors.count_documents({})
    if count > 0:
        return {"message": "Data already seeded", "count": count}

    contractors = _get_seed_contractors()
    await db.contractors.insert_many(contractors)
    return {"message": f"Seeded {len(contractors)} contractors with specialty routing", "count": len(contractors)}


@api_router.post("/seed")
async def seed_endpoint():
    """Idempotent seed endpoint for first-run setup."""
    return await seed_data()


# ==================== APP CONFIG ====================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    # Create indexes
    await db.contractors.create_index("email", unique=True)
    await db.contractors.create_index("service_zip_codes")
    await db.projects.create_index("id")
    await db.leads.create_index("contractor_id")
    await db.shares.create_index("id")
    await db.shares.create_index("project_id")
    await db.portfolio.create_index("id")
    # Follow-up + Google Reviews infra
    await followup_service.ensure_indexes(db)
    await google_reviews.ensure_indexes(db)
    # Background worker: scan for due follow-up emails every 5 min.
    asyncio.create_task(followup_service.background_worker(db, interval_seconds=300))
    logger.info("AI Renovation Visualizer API started")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
