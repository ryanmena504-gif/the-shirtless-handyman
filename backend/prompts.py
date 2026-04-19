"""
Seamless Bath AI Prompts & Constants
All renovation style prompts, analysis prompts, and routing configuration.
"""

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
    "Feature Wall": [
        {"name": "Full Rockscape Statement Wall", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this space by creating a dramatic full rockscape feature wall on the main focal wall. Hand-sculpted textured forms made from shaped foam blocks coated in microaggregate — creating a surface that looks and feels like carved natural stone with deep organic textures, ridges, and shadow lines. Add integrated LED backlighting behind and within the rock forms for a dramatic ambient glow. The surrounding walls should be finished in smooth microcement in a warm neutral tone to contrast the rough rockscape texture. Floors in continuous microcement. Keep all other walls, doors, windows, and room dimensions exactly as they are."},
        {"name": "Venetian Plaster & Rockscape Accent", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this space with polished venetian plaster on all surrounding walls creating a luminous, depth-filled surface — and on the main focal wall, create a dramatic rockscape accent panel made from sculpted textured forms with microaggregate finish. The contrast between the ultra-smooth venetian plaster and the rough organic rock texture creates a stunning visual tension. Add subtle LED backlighting to the rockscape panel. Floors in continuous beton cire. Keep all other walls, doors, windows, and room dimensions exactly as they are."},
        {"name": "Marmorino & Sculpted Stone Feature", "prompt": PRESERVATION_PREFIX + SEAMLESS_RULE + "Transform this space with Marmorino plaster (marble-dust lime plaster with translucent depth) on all surrounding walls — and on the main focal wall, create a large sculpted stone feature made from shaped foam blocks coated in microaggregate, designed to look like a natural rock face emerging from the wall. Integrate warm LED backlighting at the edges where the rockscape meets the smooth Marmorino. Floors in continuous microterrazzo. The rockscape should feel like a natural geological formation brought indoors. Keep all other walls, doors, windows, and room dimensions exactly as they are."},
    ],
}

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

Provide honest, professional contractor-style observations. Be specific about what you see.""",

    "Feature Wall": """Analyze this wall/room photo as a professional feature wall installer. Provide a detailed assessment including:

DETECTED CONDITIONS:
- Current wall surface condition (drywall, paint, existing texture)
- Wall dimensions and available focal area
- Lighting conditions and potential for backlighting
- Surrounding surfaces and how they'd contrast with a feature wall
- Any existing elements to work around (outlets, vents, built-ins)

RECOMMENDED FIXES:
- Wall preparation needed before feature installation
- Ideal feature wall type for this space (rockscape, venetian plaster accent, etc.)
- Lighting upgrades to enhance the feature
- Complementary finishes for surrounding walls
- Furniture/decor adjustments to showcase the feature

Provide honest, professional contractor-style observations. Be specific about what you see."""
}

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
    # Feature Wall / Rockscape -> seamless specialists
    "Feature Wall": ["Seamless Bathrooms", "Microcement", "Interior", "General Contractor"],
}

# Easter egg ZIP code for the Shirtless Handyman
SHIRTLESS_HANDYMAN_ZIP = "70123"

SHIRTLESS_HANDYMAN_PROFILE = {
    "id": "shirtless-handyman-easter-egg",
    "company_name": "The Shirtless Handyman",
    "email": "ryan@shirtlesshandyman.com",
    "specialties": ["Handyman", "General Contractor", "Bathroom", "Kitchen", "Remodeling", "Interior"],
    "service_zip_codes": ["70123", "701"],
    "phone": "(504) 264-4919",
    "description": "Ryan Mena — your local shirtless handyman and high-end interior specialist. From quick fixes to full luxury renovations, no job too big or small. Serving the Westbank and all of Greater New Orleans.",
    "photos": [],
    "latitude": 29.9100,
    "longitude": -90.0500,
    "rating": 5.0,
    "review_count": 999,
    "distance_miles": 0.1,
    "is_easter_egg": True,
}

