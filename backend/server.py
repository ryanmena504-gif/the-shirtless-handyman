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
    budget: Optional[str] = None
    status: str
    created_at: str
    original_image: Optional[str] = None
    additional_images: List[str] = []
    designs: List[dict] = []
    cost_estimate: Optional[dict] = None

# Budget-aware prompt modifiers
BUDGET_MODIFIERS = {
    "under_5k": {
        "materials": "using budget-friendly, affordable materials like laminate, ceramic tiles, and painted MDF",
        "features": "with DIY-friendly upgrades, paint refreshes, and affordable hardware swaps",
        "style": "focusing on cosmetic updates and smart value improvements",
    },
    "5k_10k": {
        "materials": "using mid-range quality materials like porcelain tiles, solid surface countertops, and quality wood-look vinyl",
        "features": "with updated fixtures, new lighting, and quality finishes",
        "style": "balancing style and value with practical upgrades",
    },
    "10k_20k": {
        "materials": "using high-quality materials like natural stone, quartz countertops, and hardwood",
        "features": "with premium fixtures, custom cabinetry details, and designer lighting",
        "style": "delivering a substantial transformation with lasting quality",
    },
    "20k_plus": {
        "materials": "using luxury materials like imported marble, custom millwork, and designer tiles",
        "features": "with high-end smart home features, spa-quality fixtures, and bespoke details",
        "style": "creating an exceptional, magazine-worthy luxury space",
    },
}

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

# ==================== RENOVATION STYLE PROMPTS ====================

# Strong instruction prefix to preserve room structure
PRESERVATION_PREFIX = """CRITICAL INSTRUCTIONS FOR IMAGE EDITING:
You MUST preserve exactly from the original photo:
- The exact room layout and floor plan
- All walls, their positions and angles
- All doors and their locations
- All windows and their positions
- The exact camera angle and perspective
- The room dimensions and proportions
- Any architectural features (alcoves, columns, ceiling height)

You may ONLY modify:
- Wall materials, paint colors, and finishes
- Floor materials and finishes
- Fixtures (sinks, tubs, toilets, faucets, appliances)
- Lighting fixtures and their style
- Cabinetry and built-in furniture
- Countertops and surface materials
- Decorative elements and accessories

The result must look like THIS EXACT ROOM after a renovation, not a different room.

"""

SEAMLESS_RULE = """MANDATORY SURFACE RULE: ALL surfaces must be seamless and continuous. ABSOLUTELY NO tiles, NO grout lines, NO pavers, NO brick, NO subway tile, NO ceramic, NO porcelain tile, NO mosaic. Every wall, floor, counter, and surface must use ONLY seamless continuous finishes such as: microcement, micro quartz, microterrazzo, venetian plaster (stucco veneziano), marmorino, stucco lustro, grassello di calce, tadelakt, Roman clay, lime wash, beton cire, cocciopesto, seamless epoxy, solid surface (Corian-type), or sculpted rockscape (microaggregate over shaped foam). All surfaces must appear as one smooth uninterrupted continuous plane with zero visible joints or seams.

"""

STYLE_PROMPTS = {
    # Interior Rooms
    "Bathroom": [
        {"name": "Tadelakt & Micro Quartz Spa", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this bathroom into a luxurious spa using traditional Tadelakt (Moroccan waterproof lime plaster, soap-burnished to a silky sheen) on all walls, creating a warm, mottled, organic surface — absolutely no tiles or grout anywhere. Apply waterproof micro quartz coating to the shower enclosure and tub surround for a perfectly smooth, jointless waterproof shell. Floors in continuous microcement in a warm taupe tone. Install a curbless walk-in shower with linear drain, floating vanity with integrated seamless basin, backlit oval mirror, matte brass rainfall showerhead, and warm LED ambient lighting. The space should feel like a Moroccan hammam meets modern spa. Keep the exact same room shape, door positions, and window locations."},
        {"name": "Marmorino & Rockscape", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this bathroom with polished Marmorino plaster (marble-dust lime plaster with a translucent, stone-like depth) on all walls — no tiles, no grout, just a luminous marble-like continuous surface. On one accent wall, create a dramatic rockscape feature made of sculpted textured forms with microaggregate finish — rough organic rock textures contrasting against the ultra-smooth Marmorino. Floors in continuous beton cire (polished cement) in a warm concrete tone. Freestanding soaking tub, wall-mounted matte black fixtures, recessed niches with LED backlighting, frameless glass shower partition. Keep the exact same room shape, door positions, and window locations."},
        {"name": "Roman Clay & Microcement", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this bathroom with Roman clay on the main walls creating a soft, matte, earthy handcrafted texture in a warm sand tone — no tiles or grout anywhere. Apply seamless micro quartz to the shower and all wet zones for waterproof protection. Floors in continuous microcement in a complementary warm cream. Floating double vanity with solid surface (Corian-type) integrated seamless sinks, oversized round backlit mirror, elegant pendant lighting, matte brass fixtures. Plush white towels, live greenery. Keep the exact same room shape, door positions, and window locations."},
    ],
    "Kitchen": [
        {"name": "Beton Cire & Stucco Lustro", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this kitchen with beton cire (polished cement finish) on all countertops with waterfall island edges and integrated seamless sink — a smooth, industrial-chic continuous surface with no grout. Walls finished in Stucco Lustro (high-gloss burnished lime plaster with mirror-like reflections) creating a dramatic luminous backdrop behind the range — no tile backsplash. Floors in continuous microcement. Custom flat-panel cabinets in matte charcoal with brass hardware. Professional range, pendant lights over island, under-cabinet LED strips. Keep the exact same room shape, door positions, and window locations."},
        {"name": "Micro Quartz & Rockscape", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this kitchen with seamless micro quartz countertops and backsplash creating one continuous waterproof surface from counter to ceiling — no joints, no grout. On the main focal wall, add a dramatic rockscape accent wall made from sculpted microaggregate-finished forms that look like natural carved stone. Floors in continuous microterrazzo with fine natural aggregates. Cabinets in warm walnut wood with integrated handles. Matte black fixtures. Bright pendant lighting over the island. Keep the exact same room shape, door positions, and window locations."},
        {"name": "Venetian Plaster & Grassello", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this kitchen with venetian plaster (stucco veneziano) on all visible walls creating a luminous polished finish — no tile or grout anywhere. Accent the range hood surround in Grassello di Calce (ultra-smooth luminous lime putty) for an extra layer of depth. COUNTERTOPS: Seamless microcement in a contrasting darker charcoal tone with waterfall island edges and integrated sink. FLOORS: Continuous microcement. Cream handleless push-open cabinets, integrated panel-ready appliances. Brass pendant lights, warm recessed lighting. Keep the exact same room shape, door positions, and window locations."},
    ],
    "Living Room": [
        {"name": "Roman Clay & Rockscape", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this living room with Roman clay on all walls creating a soft matte earthy texture with handcrafted warmth in a warm sand tone — no tiles, no grout, completely seamless. Add a dramatic rockscape accent wall behind the TV or fireplace area, made from sculpted textured forms with microaggregate finish creating organic rock textures. Floors in continuous microcement. Modern furniture: L-shaped sectional, marble-top coffee table, accent chairs. LED strip lighting highlighting the rockscape, recessed ceiling lights on dimmers, statement floor lamp. Built-in floating media console. Keep the exact same room shape, door positions, and window locations."},
        {"name": "Marmorino & Microterrazzo", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this living room with polished Marmorino plaster on all walls creating a translucent marble-like depth with warm undertones — completely seamless with no tiles or grout. Floors in continuous microterrazzo with fine natural stone aggregates creating an elegant seamless terrazzo surface. On the fireplace or focal wall, apply a deeper burnished Marmorino for contrast. Deep comfortable sofa, oversized ottoman, accent chairs. Warm recessed lighting on dimmers, elegant sconces, table lamps. Built-in bookshelves with seamless plaster backing. Keep the exact same room shape, door positions, and window locations."},
        {"name": "Lime Wash & Beton Cire", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this living room with soft lime wash finish on all walls in a pale warm white creating a subtle cloudy organic texture — no tiles or grout anywhere. Floors in continuous beton cire (polished cement) with a smooth satin concrete finish. Clean-lined light gray sofa, natural wood coffee table, statement lounge chair. Simple pendant lighting, arc floor lamp, sheer linen curtains diffusing natural light. Floating media console, minimal curated decor. Keep the exact same room shape, door positions, and window locations."},
    ],
    "Bedroom": [
        {"name": "Grassello & Venetian Plaster Suite", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this bedroom with Grassello di Calce (ultra-smooth luminous lime putty) on all walls in soft warm cream tones — completely seamless with zero tiles or grout. On the headboard wall, apply burnished venetian plaster in a rich deeper warm tone as a full accent wall creating luminous depth. Floors in continuous microcement. Built-in wardrobes with seamless plaster-finish doors flanking the bed. Bedside pendant lights, soft recessed ambient lighting on dimmers, blackout shades. Plush king bed with layered white and cream bedding. Keep the exact same room shape, door positions, and window locations."},
        {"name": "Tadelakt & Rockscape Retreat", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this bedroom with smooth Tadelakt plaster on all walls in a warm neutral tone — silky, soap-burnished, no tiles, no grout, no seams. Behind the bed, create a dramatic rockscape headboard wall made from sculpted textured forms with microaggregate finish, creating organic stone-like textures as a stunning natural headboard feature. Floors in continuous microcement. Floating nightstands, indirect LED lighting washing up the rockscape wall, warm recessed ceiling lights. Statement upholstered bed, high-quality white bedding, plush area rug. Keep the exact same room shape, door positions, and window locations."},
        {"name": "Roman Clay Serenity", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this bedroom with Roman clay on all walls creating a gentle matte organic handcrafted finish in warm white — no tiles or grout anywhere. Floors in continuous beton cire in a light sand tone. Low-profile platform bed with integrated storage drawers, wall-mounted floating nightstands, concealed closet with seamless plaster-finish doors. Simple ceramic pendant lights, minimal recessed lights prioritizing natural light. Organic cotton bedding in earth tones, minimal curated decor, live greenery. Keep the exact same room shape, door positions, and window locations."},
    ],
    "Kids Room": [
        {"name": "Playful Lime Wash Room", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this kids room with soft lime wash on the main walls in warm white and one accent wall in a cheerful pastel lime wash tone — no tiles or grout anywhere, all smooth continuous surfaces. Floors in continuous microcement, durable and easy to clean. Loft bed with play area underneath, colorful rounded storage cubbies, chalkboard panel section on one wall, soft area rug over the seamless floor. Fun pendant lighting, LED strip accents. Keep the exact same room shape, door positions, and window locations."},
        {"name": "Roman Clay Montessori", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this kids room with Roman clay walls in calming neutral warm tones creating a soft handcrafted texture — no tiles or grout visible anywhere. Floors in continuous microcement. Floor bed at ground level, low open shelving at child height along walls with seamless plaster finish, natural wood furniture, soft area rugs. Educational wall art, simple pendant lighting, calming warm ambient glow. All surfaces continuous and safe with no sharp edges. Keep the exact same room shape, door positions, and window locations."},
        {"name": "Venetian Plaster Nursery", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this room into a nursery with smooth venetian plaster on all walls in soft pastel tones — no tiles, no grout, just smooth continuous luminous surfaces. Floors in warm microcement. Elegant crib against the main wall, changing station, plush nursing rocker, floating shelves with seamless plaster finish. Decorative mobile, dreamy ambient pendant lighting, soft LED glow strips. The entire room should feel soft, warm, and perfectly smooth. Keep the exact same room shape, door positions, and window locations."},
    ],
    "Home Office": [
        {"name": "Stucco Lustro & Rockscape Office", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this room into an Executive Home Office with Stucco Lustro (high-gloss burnished lime plaster with mirror-like reflections) on all walls in a rich warm charcoal tone — no tiles or grout. Floors in continuous microterrazzo with fine aggregates. On the main wall behind the desk, add a dramatic rockscape accent section made from sculpted microaggregate-finished forms creating bold textured stone features. Large executive desk, ergonomic leather chair, built-in floor-to-ceiling shelving with seamless plaster backing. Brass desk lamp, recessed ceiling lights, sconces. Keep the exact same room shape, door positions, and window locations."},
        {"name": "Marmorino Creative Studio", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this room into a Modern Creative Studio with Marmorino plaster on all walls in a light warm tone creating a subtle marble-like depth — no tiles, no grout, completely seamless. Floors in continuous microcement. Height-adjustable standing desk near window, ergonomic task chair. Open shelving system against the Marmorino walls, floating seamless desk surface. Bright adjustable task lamp, LED strip behind monitors, recessed trimless ceiling lights. Clean, bright, and minimal. Keep the exact same room shape, door positions, and window locations."},
        {"name": "Beton Cire & Roman Clay Library", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this room into a Library Office with Roman clay in rich jewel tones on all walls creating a warm matte handcrafted finish — no tiles or grout anywhere. Floors in continuous beton cire (polished cement) for an industrial-elegant contrast. Traditional writing desk, comfortable upholstered desk chair, reading chair with side table. Floor-to-ceiling built-in bookshelves with seamless plaster backing and integrated lighting. Banker's lamp, reading floor lamp, warm recessed lighting. Keep the exact same room shape, door positions, and window locations."},
    ],
    # Functional Rooms
    "Garage": [
        {"name": "Seamless Epoxy Workshop", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this garage into a workshop with seamless high-build epoxy floor coating in warm gray with a smooth satin finish — no tiles, no seams, one continuous surface. Walls finished in smooth microcement creating a clean modern backdrop. Wall-mounted metal slatwall panels for tools, overhead ceiling-mounted storage racks. 8-foot solid wood workbench with seamless microcement backsplash wall. Bright 5000K LED shop lights, task lighting over workbench. Keep the exact same space layout, door positions, and window locations."},
        {"name": "Metallic Epoxy Showroom", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this garage with high-gloss metallic epoxy flooring in graphite creating a stunning seamless reflective surface — no tiles, no joints. Walls in smooth microcement in dark charcoal. Premium modular cabinet system with solid surface (Corian-type) seamless countertops. Accent lighting under cabinets, bright even LED ceiling lighting. The seamless metallic floor creates a showroom-quality finish. Keep the exact same space layout, door positions, and window locations."},
        {"name": "Microcement & Beton Cire Flex", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this garage into a multi-purpose flex space with continuous microcement flooring throughout — no tiles, no seams, completely smooth. Walls finished in beton cire (polished cement finish) for a refined industrial look. Designated zones: gym area with rubber mat overlay, workshop area with fold-down workbench, clear parking zone. Bright overhead LEDs with zone controls, ceiling fan. Keep the exact same space layout, door positions, and window locations."},
    ],
    "Laundry Room": [
        {"name": "Micro Quartz & Tadelakt Utility", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this laundry room with waterproof micro quartz coating on all wet surfaces and Tadelakt (waterproof lime plaster) on the remaining walls — no tiles, no grout, completely seamless and waterproof. Floors in continuous microcement. Stacked front-load washer/dryer, seamless solid surface countertop for folding, sleek upper cabinets, integrated utility sink. Bright clean LED lighting. Keep the exact same room shape, door positions, and window locations."},
        {"name": "Venetian Plaster Laundry Suite", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this laundry room with venetian plaster walls in a soft warm cream and continuous microcement floors — no tiles, no grout anywhere. Side-by-side premium appliances, seamless microcement countertops, custom floor-to-ceiling cabinetry with smooth plaster-finish doors. Elegant pendant lighting. Keep the exact same room shape, door positions, and window locations."},
        {"name": "Lime Wash & Microcement Compact", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this laundry room with soft lime wash on all walls in a fresh clean white and continuous microcement flooring — no tiles, no grout. Stacked washer/dryer to maximize space, pull-out drying rack, wall-mounted ironing board, open shelving against the lime wash walls. Bright efficient LED lighting. Clean, minimal, and completely seamless. Keep the exact same room shape, door positions, and window locations."},
    ],
    "Basement": [
        {"name": "Microcement & Rockscape Lounge", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this basement into an entertainment lounge with microcement on all walls and continuous microcement flooring — no tiles, no grout, completely seamless. On the main media wall, create a dramatic rockscape accent feature made from sculpted textured forms with microaggregate finish. Home theater setup, bar area with seamless beton cire counter, comfortable sectional seating, LED mood lighting washing up the rockscape wall. Keep the exact same space layout, stair positions, and window locations."},
        {"name": "Marmorino Guest Suite", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this basement into a guest suite with Marmorino plaster on all walls in warm neutral tones creating a translucent marble-like depth — no tiles, no grout anywhere. Floors in continuous microcement. Defined bedroom area with comfortable bed, bathroom partition with seamless micro quartz waterproof surfaces and Tadelakt walls, small kitchenette with seamless solid surface counter. Warm recessed lighting. Keep the exact same space layout, stair positions, and window locations."},
        {"name": "Beton Cire Recreation Room", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this basement into a recreation room with beton cire (polished cement) on all walls and continuous microcement flooring — no tiles, no grout, no vinyl, just seamless surfaces. Zones for play, exercise with rubber mat overlay, and crafts. Built-in storage with seamless plaster-finish cabinets. Bright LED lighting, flexible modular furniture. Keep the exact same space layout, stair positions, and window locations."},
    ],
    "Mudroom": [
        {"name": "Microcement & Cocciopesto Entry", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this mudroom with durable microcement on all walls and continuous cocciopesto flooring (ancient Roman terracotta-lime seamless surface with warm earthy tones) — no tiles, no grout, completely seamless and extremely durable. Built-in lockers with smooth plaster-finish doors, bench seating with hidden storage, sturdy coat hooks, shoe cubbies. Keep the exact same room shape, door positions, and window locations."},
        {"name": "Tadelakt & Lime Wash Entry", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this mudroom with Tadelakt on the lower wall sections (waterproof, wipe-clean, soap-burnished) and soft lime wash on the upper walls in warm cream — no tiles, no grout, all seamless. Floors in continuous microcement. Open storage cubbies with smooth plaster finish, sturdy hooks, floating bench with storage underneath. Warm pendant lighting. Keep the exact same room shape, door positions, and window locations."},
        {"name": "Beton Cire Modern Entry", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this mudroom with beton cire (polished cement finish) throughout walls and floors in a consistent warm gray — no tiles, no grout, completely seamless. Sleek handleless built-in cabinets with seamless plaster-finish fronts, concealed storage, floating bench, minimal wall hooks. Clean, modern, and perfectly continuous surfaces. Keep the exact same room shape, door positions, and window locations."},
    ],
    # Outdoor Areas
    "Patio": [
        {"name": "Microterrazzo & Rockscape Patio", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this patio with continuous microterrazzo flooring featuring fine natural stone aggregates in a warm tone — no tiles, no pavers, no grout, one seamless outdoor surface. On one wall or column area, create a dramatic rockscape accent feature made from sculpted forms with microaggregate finish. Covered pergola, built-in L-shaped sectional seating, gas fireplace with seamless microcement surround. String lights, LED ambient lighting. Keep the exact same space boundaries and access points."},
        {"name": "Cocciopesto Mediterranean Patio", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this patio with continuous cocciopesto flooring (ancient Roman terracotta-lime seamless surface) in warm earthy terracotta tones — no tiles, no pavers, no grout, one unbroken seamless floor. Walls finished in lime wash in a warm cream. Comfortable outdoor furniture, dining area with microcement table surface, potted plants, warm LED lighting. The cocciopesto creates a timeless Mediterranean ground surface. Keep the exact same space boundaries and access points."},
        {"name": "Microcement & Beton Cire Outdoor Living", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this patio with seamless microcement flooring in a warm sand tone — no tiles, no pavers, no grout, one continuous surface. Built-in bar counter and bench seating in beton cire (polished cement finish) with a smooth satin sheen. Modular sectional sofa, dining area with planter privacy walls finished in matching microcement. Ambient LED lighting. Keep the exact same space boundaries and access points."},
    ],
    "Pool Deck": [
        {"name": "Microterrazzo & Micro Quartz Paradise", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this pool deck with continuous microterrazzo on all walking areas — no tiles, no pavers, no grout, a perfectly seamless non-slip surface with fine natural aggregates in a warm cream tone. Apply waterproof micro quartz coating on the pool coping and immediate wet zones. Add tropical landscaping, lounge chairs, string ambient lights, and built-in outdoor seating with seamless microcement bench surfaces. Keep the exact same pool shape, deck boundaries, and access points."},
        {"name": "Cocciopesto & Rockscape Resort", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this pool deck with continuous cocciopesto surfacing (ancient Roman terracotta-lime seamless surface) in warm earthy tones on all deck areas — no tiles, no pavers, no grout. Create a rockscape feature wall or water feature surround made from sculpted textured forms with microaggregate finish creating dramatic natural stone textures. Micro quartz on pool coping for waterproof protection. Modern lounge furniture, LED pool lighting, pergola with retractable shade. Keep the exact same pool shape, deck boundaries, and access points."},
        {"name": "Micro Quartz & Tadelakt Deck", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this pool deck with waterproof micro quartz coating across all deck surfaces — no tiles, no pavers, no grout, one smooth seamless waterproof plane. Outdoor shower surround in Tadelakt (waterproof lime plaster). Built-in bench seating with seamless microcement surfaces, raised planter beds with microcement walls. Ambient string lighting, modern clean lines. Keep the exact same pool shape, deck boundaries, and access points."},
    ],
    "Backyard": [
        {"name": "Microterrazzo & Rockscape Backyard", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this backyard with continuous microterrazzo pathways and patio areas — no tiles, no pavers, no grout, seamless walkways throughout. Create a dramatic rockscape feature wall or fire pit surround made from sculpted textured forms with microaggregate finish. Outdoor kitchen station with seamless micro quartz counters, lush perimeter landscaping, pathway LED lighting. Keep the exact same yard boundaries, fence lines, and access points."},
        {"name": "Cocciopesto & Microcement Living", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this backyard with continuous cocciopesto on the main patio area (warm earthy terracotta-lime seamless surface) and microcement on pathways and seating walls — no tiles, no pavers, no grout, everything seamless. Covered dining area, fire pit with seamless microcement surround, lawn play area preserved, privacy hedge plantings. Warm pathway lighting. Keep the exact same yard boundaries, fence lines, and access points."},
        {"name": "Beton Cire Zen Retreat", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this backyard into a zen retreat with continuous beton cire (polished cement) pathways — no tiles, no stone pavers, no grout, smooth seamless walking surfaces. Water feature with seamless microcement basin, meditation garden area, Japanese maple trees, bamboo accents, minimalist seamless bench seating in microcement. Subtle landscape lighting. Keep the exact same yard boundaries, fence lines, and access points."},
    ],
    "Outdoor Kitchen": [
        {"name": "Micro Quartz & Stucco Lustro Station", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this outdoor kitchen with waterproof micro quartz on all counter surfaces, backsplash, and bar top — no tiles, no grout, completely seamless and waterproof. The grill island hood surround finished in Stucco Lustro (high-gloss burnished plaster) for a dramatic reflective accent. Microterrazzo flooring beneath. Built-in grill, pizza oven, bar seating, outdoor refrigeration, integrated seamless prep sink. Keep the exact same space boundaries and access points."},
        {"name": "Microcement & Rockscape BBQ", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this outdoor kitchen with seamless microcement on all countertops and island cladding — no tiles, no grout. On the back wall or feature area, create a rockscape surround made from sculpted textured forms with microaggregate finish creating a dramatic stone-like cooking alcove. Floors in continuous microterrazzo. Pendant lighting, dining seating area. Keep the exact same space boundaries and access points."},
        {"name": "Beton Cire & Cocciopesto Kitchen", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this outdoor kitchen with beton cire (polished cement) on all countertops creating a smooth industrial-chic seamless surface — no tiles, no grout. Floors in continuous cocciopesto (warm earthy terracotta-lime seamless surface) for a Mediterranean feel. Sleek stainless steel built-in appliances, seamless integrated storage, LED strip lighting under counters, clean-lined outdoor furniture. Keep the exact same space boundaries and access points."},
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
    project_type: str = Form(...),
    budget: str = Form(...),
    primary_index: int = Form(0),
    additional_photos: List[UploadFile] = File(default=[]),
):
    image_data = await photo.read()
    image_base64 = base64.b64encode(image_data).decode("utf-8")
    content_type = photo.content_type or "image/jpeg"

    # Build list of all images (primary first, then additional)
    all_images = [f"data:{content_type};base64,{image_base64}"]
    for extra in additional_photos:
        extra_data = await extra.read()
        extra_b64 = base64.b64encode(extra_data).decode("utf-8")
        extra_ct = extra.content_type or "image/jpeg"
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

    # Mark as generating and return immediately
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"status": "generating"}},
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


def _do_generation(project_id: str, project: dict, thread_db, loop):
    import litellm
    from emergentintegrations.llm.utils import get_integration_proxy_url

    project_type = project["project_type"]
    budget = project.get("budget", "10k_20k")  # Default to mid-high if not set
    styles = STYLE_PROMPTS.get(project_type, STYLE_PROMPTS["Bathroom"])
    
    # Get budget modifier for prompt enhancement
    budget_mod = BUDGET_MODIFIERS.get(budget, BUDGET_MODIFIERS["10k_20k"])

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

    # Reinforcement suffix to ensure room preservation
    preservation_suffix = " IMPORTANT: This must look like the SAME room after renovation. Preserve the exact camera angle, room shape, wall positions, door locations, and window placements from the original photo. Only change materials, finishes, fixtures, and decor."

    designs = []
    for style in styles:
        try:
            # Enhance the prompt with budget-specific context and preservation reminder
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
            logger.info(f"Generated: {style['name']} for project {project_id} (budget: {budget})")
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


# --- Room Analysis with AI Vision ---

ROOM_ANALYSIS_PROMPTS = {
    "Bathroom": """Analyze this bathroom photo as a professional renovation contractor. Provide a detailed assessment including:

DETECTED CONDITIONS:
- Surface wear (tile condition, grout, caulk, paint)
- Signs of moisture damage or potential water issues
- Outdated fixtures, materials, or design elements
- Layout inefficiencies or poor space utilization
- Lighting quality and placement issues
- Ventilation concerns

RECOMMENDED FIXES:
- Waterproofing improvements needed
- Material upgrades (tiles, countertops, fixtures)
- Layout enhancements for better functionality
- Lighting improvements
- Ventilation solutions

Provide honest, professional contractor-style observations. Be specific about what you see.""",

    "Kitchen": """Analyze this kitchen photo as a professional renovation contractor. Provide a detailed assessment including:

DETECTED CONDITIONS:
- Cabinet condition (wear, outdated style, functionality)
- Countertop condition and material quality
- Appliance age and efficiency concerns
- Layout inefficiencies (work triangle, storage)
- Lighting adequacy and placement
- Flooring condition and suitability

RECOMMENDED FIXES:
- Cabinet refacing vs replacement needs
- Countertop material upgrades
- Appliance updates for efficiency
- Layout improvements for workflow
- Lighting enhancements
- Storage solutions

Provide honest, professional contractor-style observations. Be specific about what you see.""",

    "default": """Analyze this room photo as a professional renovation contractor. Provide a detailed assessment including:

DETECTED CONDITIONS:
- Surface conditions (walls, floors, ceiling)
- Signs of wear, damage, or deterioration
- Outdated materials or design elements
- Layout inefficiencies
- Lighting quality issues
- Any structural or safety concerns visible

RECOMMENDED FIXES:
- Material upgrades needed
- Surface repairs or replacements
- Layout improvements
- Lighting enhancements
- Design updates for modern functionality

Provide honest, professional contractor-style observations. Be specific about what you see."""
}

def _run_analysis(project_id: str, project: dict, thread_db, loop):
    """Run AI-powered room analysis in background thread."""
    import litellm
    from emergentintegrations.llm.utils import get_integration_proxy_url

    project_type = project["project_type"]
    
    # Get the original image
    original_image_data = project.get("original_image", "")
    if not original_image_data.startswith("data:"):
        loop.run_until_complete(
            thread_db.projects.update_one(
                {"id": project_id},
                {"$set": {"analysis_status": "failed", "analysis_error": "No image found"}},
            )
        )
        return

    # Gather additional images for richer context
    additional_images = project.get("additional_images", [])

    api_key = os.environ.get("EMERGENT_LLM_KEY", "")
    proxy_url = get_integration_proxy_url() + "/llm"

    # Get appropriate analysis prompt
    analysis_prompt = ROOM_ANALYSIS_PROMPTS.get(project_type, ROOM_ANALYSIS_PROMPTS["default"])

    num_photos = 1 + len(additional_images)
    multi_photo_note = ""
    if additional_images:
        multi_photo_note = f"\n\nYou are provided {num_photos} photos of the same room from different angles. Use ALL photos to form a comprehensive assessment. The first image is the primary angle."
    
    # Build the vision request
    full_prompt = f"""{analysis_prompt}{multi_photo_note}

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

    # Build content array with all images
    content_parts = [{"type": "text", "text": full_prompt}]
    content_parts.append({"type": "image_url", "image_url": {"url": original_image_data}})
    for extra_img in additional_images:
        if extra_img.startswith("data:"):
            content_parts.append({"type": "image_url", "image_url": {"url": extra_img}})

    try:
        response = litellm.completion(
            model="openai/gpt-4o",
            api_key=api_key,
            api_base=proxy_url,
            messages=[
                {
                    "role": "user",
                    "content": content_parts
                }
            ],
            max_tokens=2000,
            timeout=60,
        )
        
        analysis_text = response.choices[0].message.content
        
        # Try to parse JSON from response
        import json
        import re
        
        # Extract JSON from response (might be wrapped in markdown code blocks)
        json_match = re.search(r'\{[\s\S]*\}', analysis_text)
        if json_match:
            analysis_data = json.loads(json_match.group())
        else:
            # Fallback if JSON parsing fails
            analysis_data = {
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


# Project type to specialty routing for lead prioritization
PROJECT_TYPE_ROUTING = {
    # Bathroom/Shower -> prioritize Seamless Bathrooms LLC and bathroom specialists
    "Bathroom": ["Seamless Bathrooms", "Microcement", "Tile", "Bathroom"],
    "Shower": ["Seamless Bathrooms", "Microcement", "Tile", "Bathroom"],
    # Kitchen -> general contractors
    "Kitchen": ["General Contractor", "Kitchen", "Remodeling"],
    # Garage -> epoxy flooring specialists
    "Garage": ["Epoxy Flooring", "Concrete", "Garage"],
    # Outdoor areas -> landscapers and concrete contractors
    "Patio": ["Landscaping", "Concrete", "Outdoor", "Hardscape"],
    "Pool Deck": ["Landscaping", "Concrete", "Pool", "Outdoor"],
    "Backyard": ["Landscaping", "Hardscape", "Outdoor"],
    "Outdoor Kitchen": ["Outdoor", "Concrete", "Landscaping", "Kitchen"],
}

# Easter egg ZIP code for the Shirtless Handyman
SHIRTLESS_HANDYMAN_ZIP = "70123"

SHIRTLESS_HANDYMAN_PROFILE = {
    "id": "shirtless-handyman-easter-egg",
    "company_name": "The Shirtless Handyman",
    "email": "ryan@shirtlesshandyman.com",
    "specialties": ["Handyman", "General Contractor", "Bathroom", "Kitchen", "Remodeling", "Interior"],
    "service_zip_codes": ["70123", "701"],
    "phone": "(504) 555-RYAN",
    "description": "Ryan Mena — your local shirtless handyman and high-end interior specialist. From quick fixes to full luxury renovations, no job too big or small. Serving the Westbank and all of Greater New Orleans.",
    "photos": [],
    "latitude": 29.9100,
    "longitude": -90.0500,
    "rating": 5.0,
    "review_count": 999,
    "distance_miles": 0.1,
    "is_easter_egg": True,
}

@api_router.get("/contractors/search")
async def search_contractors(zip_code: str, project_type: str = ""):
    projection = {"_id": 0, "password_hash": 0}
    query = {"service_zip_codes": {"$in": [zip_code, zip_code[:3]]}}
    contractors = await db.contractors.find(query, projection).to_list(50)

    # If no results by zip, get all contractors
    if not contractors:
        contractors = await db.contractors.find({}, projection).to_list(20)

    user_coords = get_zip_coords(zip_code)

    # Calculate distance for each contractor
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

    # Apply project-type based routing/prioritization
    if project_type and project_type in PROJECT_TYPE_ROUTING:
        priority_specialties = PROJECT_TYPE_ROUTING[project_type]
        
        def get_priority_score(contractor):
            """Lower score = higher priority"""
            specialties = contractor.get("specialties", [])
            company_name = contractor.get("company_name", "").lower()
            
            # Check for priority matches
            for idx, priority in enumerate(priority_specialties):
                priority_lower = priority.lower()
                # Check company name first (highest priority)
                if priority_lower in company_name:
                    return idx * 10  # Company name match gets top priority
                # Check specialties
                for spec in specialties:
                    if priority_lower in spec.lower() or spec.lower() in priority_lower:
                        return (idx + 1) * 10 + 5
            
            # No priority match - use distance only (high number)
            return 1000 + contractor.get("distance_miles", 999)
        
        # Sort by priority score first, then by distance
        contractors.sort(key=lambda x: (get_priority_score(x), x.get("distance_miles", 999)))
    else:
        # Default sort by distance only
        contractors.sort(key=lambda x: x.get("distance_miles", 999))

    # Easter egg: Shirtless Handyman for ZIP 70123
    if zip_code == SHIRTLESS_HANDYMAN_ZIP:
        handyman = dict(SHIRTLESS_HANDYMAN_PROFILE)
        contractors.insert(0, handyman)

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

    before_data = await before_photo.read()
    before_b64 = base64.b64encode(before_data).decode("utf-8")
    before_ct = before_photo.content_type or "image/jpeg"

    after_data = await after_photo.read()
    after_b64 = base64.b64encode(after_data).decode("utf-8")
    after_ct = after_photo.content_type or "image/jpeg"

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

@api_router.post("/seed")
async def seed_data():
    count = await db.contractors.count_documents({})
    if count > 0:
        return {"message": "Data already seeded", "count": count}

    sample_contractors = [
        # PRIORITY: Seamless Bathrooms LLC - for Bathroom/Shower projects
        {
            "id": str(uuid.uuid4()),
            "email": "info@seamlessbathrooms.com",
            "password_hash": hash_password("password123"),
            "company_name": "Seamless Bathrooms LLC",
            "specialties": ["Seamless Bathrooms", "Microcement", "Bathroom", "Shower", "Tile"],
            "service_zip_codes": ["701", "700", "70112", "70113", "70114", "70115", "70116", "70117", "70118", "70119", "70130", "70124", "70125"],
            "phone": "(504) 555-0001",
            "description": "New Orleans' premier seamless bathroom specialists. We transform bathrooms with microcement, luxury tile, and modern spa designs. Grout-free, waterproof, stunning results.",
            "photos": [],
            "latitude": 29.9546,
            "longitude": -90.0701,
            "rating": 4.9,
            "review_count": 247,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        # General Contractor - for Kitchen projects
        {
            "id": str(uuid.uuid4()),
            "email": "info@crescentcityreno.com",
            "password_hash": hash_password("password123"),
            "company_name": "Crescent City General Contractors",
            "specialties": ["General Contractor", "Kitchen", "Remodeling", "Bathroom"],
            "service_zip_codes": ["701", "700", "70112", "70113", "70114", "70115", "70116", "70117", "70118", "70119", "70130"],
            "phone": "(504) 555-0101",
            "description": "Full-service general contracting for kitchen remodels, additions, and whole-home renovations. Licensed and insured in Louisiana.",
            "photos": [],
            "latitude": 29.9520,
            "longitude": -90.0750,
            "rating": 4.8,
            "review_count": 184,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        # Epoxy Flooring Specialist - for Garage projects
        {
            "id": str(uuid.uuid4()),
            "email": "info@nolaepoxypros.com",
            "password_hash": hash_password("password123"),
            "company_name": "NOLA Epoxy Pros",
            "specialties": ["Epoxy Flooring", "Garage", "Concrete", "Industrial Flooring"],
            "service_zip_codes": ["701", "700", "70112", "70113", "70114", "70115", "70124", "70125", "70126", "70131"],
            "phone": "(504) 555-0202",
            "description": "Professional epoxy floor coatings for garages, workshops, and commercial spaces. Metallic finishes, chip systems, and industrial-grade solutions.",
            "photos": [],
            "latitude": 29.9369,
            "longitude": -90.0332,
            "rating": 4.7,
            "review_count": 112,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        # Landscaping & Concrete - for Outdoor projects
        {
            "id": str(uuid.uuid4()),
            "email": "info@bigeasylandscaping.com",
            "password_hash": hash_password("password123"),
            "company_name": "Big Easy Landscaping & Hardscape",
            "specialties": ["Landscaping", "Hardscape", "Concrete", "Patio", "Outdoor"],
            "service_zip_codes": ["701", "700", "70116", "70117", "70118", "70119", "70124", "70127", "70128"],
            "phone": "(504) 555-0303",
            "description": "Complete outdoor living transformations - patios, pool decks, outdoor kitchens, landscaping, and decorative concrete. Built for New Orleans climate.",
            "photos": [],
            "latitude": 29.9624,
            "longitude": -90.0586,
            "rating": 4.6,
            "review_count": 156,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        # Pool & Outdoor Specialist
        {
            "id": str(uuid.uuid4()),
            "email": "info@gardendistrict.com",
            "password_hash": hash_password("password123"),
            "company_name": "Garden District Pool & Patio",
            "specialties": ["Pool", "Concrete", "Landscaping", "Outdoor", "Pool Deck"],
            "service_zip_codes": ["701", "700", "70115", "70118", "70125", "70130", "70113"],
            "phone": "(504) 555-0404",
            "description": "Luxury pool decks, patios, and outdoor living spaces in the Garden District and Uptown. Travertine, pavers, and custom concrete designs.",
            "photos": [],
            "latitude": 29.9260,
            "longitude": -90.1004,
            "rating": 4.8,
            "review_count": 143,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        # Additional General Contractor
        {
            "id": str(uuid.uuid4()),
            "email": "info@bayouremodelingco.com",
            "password_hash": hash_password("password123"),
            "company_name": "Bayou Remodeling Co.",
            "specialties": ["General Contractor", "Kitchen", "Bathroom", "Remodeling"],
            "service_zip_codes": ["701", "700", "70112", "70114", "70126", "70127", "70128", "70131", "70148"],
            "phone": "(504) 555-0505",
            "description": "From Lakeview to the Westbank, quality kitchen and bath remodels across Greater New Orleans. 20+ years experience.",
            "photos": [],
            "latitude": 30.0037,
            "longitude": -90.1084,
            "rating": 4.5,
            "review_count": 98,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    ]

    await db.contractors.insert_many(sample_contractors)
    return {"message": "Seeded 6 contractors with specialty routing", "count": 6}


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
    logger.info("AI Renovation Visualizer API started")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
