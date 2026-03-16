from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import base64
import asyncio
import uuid
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from auth import hash_password, verify_password, create_token, decode_token
from cost_estimator import estimate_cost

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# ==================== PYDANTIC MODELS ====================

class ContractorRegister(BaseModel):
    email: str
    password: str
    company_name: str
    specialties: List[str] = []
    service_zip_codes: List[str] = []
    phone: str = ""
    description: str = ""
    latitude: float = 0.0
    longitude: float = 0.0

class ContractorLogin(BaseModel):
    email: str
    password: str

class ContractorUpdate(BaseModel):
    company_name: Optional[str] = None
    specialties: Optional[List[str]] = None
    service_zip_codes: Optional[List[str]] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    photos: Optional[List[str]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class LeadCreate(BaseModel):
    name: str
    phone: str
    email: str
    zip_code: str
    project_description: str = ""
    selected_design_style: str = ""
    room_photo: str = ""
    project_id: Optional[str] = None
    contractor_id: Optional[str] = None

class ProjectResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    project_type: str
    zip_code: str
    status: str
    created_at: str
    original_image: Optional[str] = None
    designs: List[dict] = []
    cost_estimate: Optional[dict] = None

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
}

def get_zip_coords(zip_code: str):
    if zip_code in ZIP_COORDINATES:
        return ZIP_COORDINATES[zip_code]
    prefix = zip_code[:3]
    for zc, coords in ZIP_COORDINATES.items():
        if zc[:3] == prefix:
            return (coords[0] + 0.02, coords[1] + 0.02)
    return (39.8283, -98.5795)  # Center of US

# ==================== RENOVATION STYLE PROMPTS ====================

STYLE_PROMPTS = {
    "Bathroom": [
        {"name": "Modern Spa Renovation", "prompt": "Redesign this exact room as a modern spa bathroom renovation. Keep the same room layout, dimensions, walls, and camera perspective. Replace surfaces with natural stone tiles, add a freestanding soaking tub, rainfall shower head, warm LED lighting, live plants, wooden vanity with vessel sink, and a large mirror. Photorealistic renovation of this specific room."},
        {"name": "Luxury Tile Renovation", "prompt": "Redesign this exact room as a luxury tile bathroom renovation. Keep the same room layout, dimensions, walls, and camera perspective. Apply floor-to-ceiling marble-look porcelain large format tiles, add a frameless glass shower enclosure, linear drain, recessed niches with accent lighting, floating vanity, and contemporary brushed gold fixtures. Photorealistic renovation of this specific room."},
        {"name": "Seamless Microcement Renovation", "prompt": "Redesign this exact room as a seamless microcement bathroom renovation. Keep the same room layout, dimensions, walls, and camera perspective. Apply continuous microcement concrete-look finish to walls and floor, add an integrated shower area, wall-mounted toilet, floating oak vanity, round backlit mirror, and industrial-chic pendant lights. Photorealistic renovation of this specific room."},
    ],
    "Shower": [
        {"name": "Modern Spa Renovation", "prompt": "Redesign this exact room as a luxury walk-in spa shower renovation. Keep the same room layout, dimensions, and camera perspective. Add large format natural stone tiles, frameless glass panels, rainfall and handheld shower heads, a built-in bench, recessed niches with ambient lighting, and brushed nickel fixtures. Photorealistic renovation of this specific room."},
        {"name": "Luxury Tile Renovation", "prompt": "Redesign this exact room as a luxury tile shower renovation. Keep the same room layout, dimensions, and camera perspective. Apply floor-to-ceiling mosaic and large format tiles, add body jets, chromotherapy LED lights, a teak wood bench, and frameless glass enclosure. Photorealistic renovation of this specific room."},
        {"name": "Seamless Microcement Renovation", "prompt": "Redesign this exact room as a seamless microcement shower renovation. Keep the same room layout, dimensions, and camera perspective. Apply continuous microcement to walls and floor with a curbless linear drain, minimalist glass partition, matte black wall-mounted fixtures, and a floating shelf niche. Photorealistic renovation of this specific room."},
    ],
    "Kitchen": [
        {"name": "Modern Spa-Inspired Renovation", "prompt": "Redesign this exact room as a contemporary chef kitchen renovation. Keep the same room layout, dimensions, and camera perspective. Add a large waterfall quartz island, custom sage green cabinetry, professional-grade stainless appliances, herringbone backsplash, pendant lights, hardwood floors, and open shelving. Photorealistic renovation of this specific room."},
        {"name": "Luxury Tile Renovation", "prompt": "Redesign this exact room as a luxury tiled kitchen renovation. Keep the same room layout, dimensions, and camera perspective. Apply stunning marble-look backsplash tiles, add shaker-style white cabinets, butcher block island, apron-front sink, brass fixtures, and pendant lighting. Photorealistic renovation of this specific room."},
        {"name": "Seamless Minimalist Renovation", "prompt": "Redesign this exact room as a seamless minimalist kitchen renovation. Keep the same room layout, dimensions, and camera perspective. Add handleless walnut and white cabinets, integrated appliances, waterfall marble island, hidden storage, under-cabinet LED lighting, and a statement range hood. Photorealistic renovation of this specific room."},
    ],
    "Pool Deck": [
        {"name": "Modern Spa Renovation", "prompt": "Redesign this exact outdoor space as a resort-style pool deck renovation. Keep the same layout, dimensions, and camera perspective. Add travertine pavers, an infinity-edge pool, built-in hot tub, outdoor kitchen area, tropical landscaping, lounge chairs, and string lights. Photorealistic renovation of this specific space."},
        {"name": "Luxury Tile Renovation", "prompt": "Redesign this exact outdoor space as a modern geometric pool deck renovation. Keep the same layout, dimensions, and camera perspective. Add large format concrete pavers, a rectangular pool with LED lighting, raised planters, built-in seating, and a pergola with retractable shade. Photorealistic renovation of this specific space."},
        {"name": "Seamless Natural Stone Renovation", "prompt": "Redesign this exact outdoor space as a natural stone pool deck renovation. Keep the same layout, dimensions, and camera perspective. Add flagstone pavers, a freeform pool with waterfall, mature landscaping, an outdoor fireplace, and a covered cabana. Photorealistic renovation of this specific space."},
    ],
    "Patio": [
        {"name": "Modern Spa Renovation", "prompt": "Redesign this exact outdoor space as a modern outdoor living room patio renovation. Keep the same layout, dimensions, and camera perspective. Add a covered pergola, built-in L-shaped sofa, outdoor TV, ceiling fans, string lights, a stone fireplace, and composite decking. Photorealistic renovation of this specific space."},
        {"name": "Luxury Tile Renovation", "prompt": "Redesign this exact outdoor space as a Mediterranean courtyard patio renovation. Keep the same layout, dimensions, and camera perspective. Add terracotta tile flooring, an arched pergola with climbing vines, a central fountain, wrought iron furniture, and olive trees in terracotta pots. Photorealistic renovation of this specific space."},
        {"name": "Seamless Modern Renovation", "prompt": "Redesign this exact outdoor space as a modern rooftop patio renovation. Keep the same layout, dimensions, and camera perspective. Add porcelain tile pavers, a sectional sofa, dining area with planter walls, built-in bar, ambient lighting, and artificial turf accent. Photorealistic renovation of this specific space."},
    ],
}

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "AI Renovation Visualizer API"}

# --- Project Routes ---

@api_router.post("/projects/upload")
async def upload_project(
    photo: UploadFile = File(...),
    zip_code: str = Form(...),
    project_type: str = Form(...)
):
    image_data = await photo.read()
    image_base64 = base64.b64encode(image_data).decode("utf-8")
    content_type = photo.content_type or "image/jpeg"

    project_id = str(uuid.uuid4())
    project = {
        "id": project_id,
        "project_type": project_type,
        "zip_code": zip_code,
        "original_image": f"data:{content_type};base64,{image_base64}",
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

    # Mark as generating and return immediately
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"status": "generating"}},
    )

    # Run generation in a separate thread to avoid blocking the event loop
    import threading
    thread = threading.Thread(target=_run_generation_sync, args=(project_id, project), daemon=True)
    thread.start()

    return {"id": project_id, "status": "generating"}


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


def _do_generation(project_id: str, project: dict, thread_db, loop):
    import litellm
    from emergentintegrations.llm.utils import get_integration_proxy_url

    project_type = project["project_type"]
    styles = STYLE_PROMPTS.get(project_type, STYLE_PROMPTS["Bathroom"])

    # Get the original image bytes
    original_image_data = project.get("original_image", "")
    image_bytes = None
    if original_image_data.startswith("data:"):
        b64_part = original_image_data.split(",", 1)[1]
        image_bytes = base64.b64decode(b64_part)

    if not image_bytes:
        loop.run_until_complete(
            thread_db.projects.update_one(
                {"id": project_id},
                {"$set": {"status": "failed", "error": "No original image found"}},
            )
        )
        return

    api_key = os.environ.get("EMERGENT_LLM_KEY", "")
    proxy_url = get_integration_proxy_url() + "/llm"

    designs = []
    for style in styles:
        try:
            response = litellm.image_edit(
                image=image_bytes,
                prompt=style["prompt"],
                model="openai/gpt-image-1",
                api_key=api_key,
                api_base=proxy_url,
                quality="low",
                n=1,
                timeout=180,
            )
            if response and response.data:
                img = response.data[0]
                if hasattr(img, 'b64_json') and img.b64_json:
                    designs.append({
                        "name": style["name"],
                        "image": f"data:image/png;base64,{img.b64_json}",
                    })
                elif hasattr(img, 'url') and img.url:
                    import requests
                    img_response = requests.get(img.url, timeout=30)
                    designs.append({
                        "name": style["name"],
                        "image": f"data:image/png;base64,{base64.b64encode(img_response.content).decode('utf-8')}",
                    })
            logger.info(f"Generated: {style['name']} for project {project_id}")
        except Exception as e:
            logger.error(f"Image edit error for {style['name']}: {e}")

    # Calculate cost estimate
    cost = estimate_cost(project_type, project["zip_code"])

    status = "completed" if len(designs) > 0 else "failed"
    loop.run_until_complete(
        thread_db.projects.update_one(
            {"id": project_id},
            {"$set": {"designs": designs, "cost_estimate": cost, "status": status}},
        )
    )
    logger.info(f"Generation complete for {project_id}: {len(designs)} designs")


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


class VoteData(BaseModel):
    design_index: int

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
    return {
        "token": token,
        "contractor": {
            "id": contractor_id,
            "email": data.email,
            "company_name": data.company_name,
        },
    }


@api_router.post("/contractors/login")
async def login_contractor(data: ContractorLogin):
    contractor = await db.contractors.find_one({"email": data.email}, {"_id": 0})
    if not contractor or not verify_password(data.password, contractor["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(contractor["id"])
    return {
        "token": token,
        "contractor": {
            "id": contractor["id"],
            "email": contractor["email"],
            "company_name": contractor["company_name"],
        },
    }


@api_router.get("/contractors/me")
async def get_my_profile(contractor_id: str = Depends(decode_token)):
    contractor = await db.contractors.find_one({"id": contractor_id}, {"_id": 0, "password_hash": 0})
    if not contractor:
        raise HTTPException(status_code=404, detail="Contractor not found")
    return contractor


@api_router.put("/contractors/me")
async def update_my_profile(data: ContractorUpdate, contractor_id: str = Depends(decode_token)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    await db.contractors.update_one({"id": contractor_id}, {"$set": update_data})
    contractor = await db.contractors.find_one({"id": contractor_id}, {"_id": 0, "password_hash": 0})
    return contractor


@api_router.get("/contractors/search")
async def search_contractors(zip_code: str, project_type: str = ""):
    projection = {"_id": 0, "password_hash": 0}
    query = {"service_zip_codes": {"$in": [zip_code, zip_code[:3]]}}
    contractors = await db.contractors.find(query, projection).to_list(50)

    # If no results by zip, get all contractors
    if not contractors:
        contractors = await db.contractors.find({}, projection).to_list(20)

    user_coords = get_zip_coords(zip_code)

    for c in contractors:
        clat = c.get("latitude", 0)
        clng = c.get("longitude", 0)
        if clat and clng:
            import math
            dlat = math.radians(clat - user_coords[0])
            dlng = math.radians(clng - user_coords[1])
            a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(user_coords[0])) * math.cos(math.radians(clat)) * math.sin(dlng / 2) ** 2
            c_val = 2 * math.asin(math.sqrt(a))
            c["distance_miles"] = round(c_val * 3956, 1)
        else:
            c["distance_miles"] = 0

    contractors.sort(key=lambda x: x.get("distance_miles", 999))
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
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.leads.insert_one(lead)
    return {"id": lead_id, "status": "new", "message": "Quote request submitted successfully"}


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


# --- Admin Routes ---

class AdminLogin(BaseModel):
    password: str

@api_router.post("/admin/login")
async def admin_login(data: AdminLogin):
    admin_pw = os.environ.get("ADMIN_PASSWORD", "")
    if not admin_pw or data.password != admin_pw:
        raise HTTPException(status_code=401, detail="Invalid admin password")
    token = create_token("admin")
    return {"token": token, "role": "admin"}

@api_router.get("/admin/leads")
async def admin_get_all_leads(admin_id: str = Depends(decode_token)):
    if admin_id != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    lead_projection = {"_id": 0}
    leads = await db.leads.find({}, lead_projection).sort("created_at", -1).to_list(500)
    # Enrich with contractor names
    for lead in leads:
        if lead.get("contractor_id"):
            c = await db.contractors.find_one({"id": lead["contractor_id"]}, {"_id": 0, "company_name": 1})
            lead["contractor_name"] = c["company_name"] if c else "Unknown"
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
    return {
        "total_leads": total_leads,
        "new_leads": new_leads,
        "total_contractors": total_contractors,
        "total_projects": total_projects,
        "completed_projects": completed_projects,
    }


# --- Seed Data ---

@api_router.post("/seed")
async def seed_data():
    count = await db.contractors.count_documents({})
    if count > 0:
        return {"message": "Data already seeded", "count": count}

    sample_contractors = [
        {
            "id": str(uuid.uuid4()),
            "email": "info@crescentcityreno.com",
            "password_hash": hash_password("password123"),
            "company_name": "Crescent City Renovations",
            "specialties": ["Bathroom", "Kitchen", "Shower"],
            "service_zip_codes": ["701", "700", "70112", "70113", "70114", "70115", "70116", "70117", "70118", "70119", "70130"],
            "phone": "(504) 555-0101",
            "description": "New Orleans' trusted renovation experts. From French Quarter charm to modern Uptown elegance, we transform kitchens and bathrooms with local craftsmanship.",
            "photos": [],
            "latitude": 29.9546,
            "longitude": -90.0701,
            "rating": 4.9,
            "review_count": 184,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "email": "info@nolaoutdoorliving.com",
            "password_hash": hash_password("password123"),
            "company_name": "NOLA Outdoor Living",
            "specialties": ["Pool Deck", "Patio", "Kitchen"],
            "service_zip_codes": ["701", "700", "70112", "70113", "70114", "70115", "70124", "70125", "70126", "70131"],
            "phone": "(504) 555-0202",
            "description": "Specializing in outdoor living spaces built for the New Orleans climate. Custom pool decks, patios, and outdoor kitchens with hurricane-rated materials.",
            "photos": [],
            "latitude": 29.9369,
            "longitude": -90.0332,
            "rating": 4.7,
            "review_count": 112,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "email": "info@bigeasybuilders.com",
            "password_hash": hash_password("password123"),
            "company_name": "Big Easy Builders",
            "specialties": ["Kitchen", "Bathroom", "Patio", "Shower"],
            "service_zip_codes": ["701", "700", "70116", "70117", "70118", "70119", "70124", "70127", "70128"],
            "phone": "(504) 555-0303",
            "description": "Full-service home renovation company serving the Greater New Orleans area. Licensed, insured, and experienced with historic and modern homes.",
            "photos": [],
            "latitude": 29.9624,
            "longitude": -90.0586,
            "rating": 4.6,
            "review_count": 97,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "email": "info@gardendistrict.com",
            "password_hash": hash_password("password123"),
            "company_name": "Garden District Design & Build",
            "specialties": ["Bathroom", "Kitchen", "Shower"],
            "service_zip_codes": ["701", "700", "70115", "70118", "70125", "70130", "70113"],
            "phone": "(504) 555-0404",
            "description": "Luxury renovation specialists in the Garden District and Uptown New Orleans. We blend historic preservation with modern design for stunning results.",
            "photos": [],
            "latitude": 29.9260,
            "longitude": -90.1004,
            "rating": 4.8,
            "review_count": 143,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "email": "info@bayouremodelingco.com",
            "password_hash": hash_password("password123"),
            "company_name": "Bayou Remodeling Co.",
            "specialties": ["Pool Deck", "Patio", "Bathroom", "Kitchen"],
            "service_zip_codes": ["701", "700", "70112", "70114", "70126", "70127", "70128", "70131", "70148"],
            "phone": "(504) 555-0505",
            "description": "From Lakeview to the Westbank, Bayou Remodeling delivers quality renovations across New Orleans. Expert in pool decks, patios, and whole-home remodels.",
            "photos": [],
            "latitude": 30.0037,
            "longitude": -90.1084,
            "rating": 4.5,
            "review_count": 78,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    ]

    await db.contractors.insert_many(sample_contractors)
    return {"message": "Seeded 5 New Orleans contractors", "count": 5}


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
    logger.info("AI Renovation Visualizer API started")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
