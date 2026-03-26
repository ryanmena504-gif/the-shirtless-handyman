import { useState } from "react";
import { X, Layers, DollarSign, Hammer, MapPin, Phone, Star, ChevronRight, FileDown } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

// Material zones defined as percentage areas of the image
// Each zone covers a specific region that typically contains that material type
const MATERIAL_ZONES = {
  walls: {
    id: "walls",
    label: "Walls",
    // Upper portion of image, excluding corners
    bounds: { top: 5, left: 10, width: 80, height: 35 },
    icon: "🧱",
  },
  floors: {
    id: "floors",
    label: "Flooring",
    // Bottom portion of image
    bounds: { top: 70, left: 5, width: 90, height: 25 },
    icon: "🪵",
  },
  fixtures: {
    id: "fixtures",
    label: "Fixtures",
    // Center-left area (where sinks, toilets, tubs typically are)
    bounds: { top: 35, left: 5, width: 35, height: 35 },
    icon: "🚿",
  },
  countertops: {
    id: "countertops",
    label: "Countertops & Surfaces",
    // Center-right area
    bounds: { top: 35, left: 55, width: 40, height: 30 },
    icon: "✨",
  },
  lighting: {
    id: "lighting",
    label: "Lighting",
    // Top center
    bounds: { top: 0, left: 30, width: 40, height: 15 },
    icon: "💡",
  },
};

// Material data mapped by renovation style and zone
const STYLE_MATERIALS = {
  "Modern Luxury Spa": {
    walls: {
      name: "Honed Travertine Stone",
      finish: "Natural matte with filled veins",
      costPerSqFt: { low: 18, high: 45 },
      specialty: "Tile",
      description: "Premium natural travertine with a smooth honed finish, creating a warm spa-like atmosphere with organic texture.",
    },
    floors: {
      name: "Heated Limestone Tile",
      finish: "Tumbled natural stone with radiant heat",
      costPerSqFt: { low: 20, high: 50 },
      specialty: "Tile",
      description: "Natural limestone flooring with integrated radiant heating for barefoot comfort in a luxury spa setting.",
    },
    fixtures: {
      name: "Freestanding Soaking Tub",
      finish: "Matte white solid surface",
      costPerSqFt: { low: 0, high: 0, unit: "$3,500 - $8,000" },
      specialty: "Bathroom",
      description: "Sculptural deep soaking tub with ergonomic interior, clean lines, and premium matte finish for hotel-quality luxury.",
    },
    countertops: {
      name: "Teak Wood Vanity",
      finish: "Natural oiled teak with waterproof seal",
      costPerSqFt: { low: 85, high: 200 },
      specialty: "Bathroom",
      description: "Floating teak vanity with soft-close drawers, integrated vessel sink, and warm natural wood grain.",
    },
    lighting: {
      name: "Warm Ambient LED System",
      finish: "2700K dimmable with backlit mirror",
      costPerSqFt: { low: 0, high: 0, unit: "$800 - $2,500 complete" },
      specialty: "Bathroom",
      description: "Layered lighting with recessed ceiling fixtures, backlit mirror, and under-vanity glow for spa ambiance.",
    },
  },
  "Bold Contemporary": {
    walls: {
      name: "Charcoal Porcelain Slab",
      finish: "Matte black large format",
      costPerSqFt: { low: 22, high: 55 },
      specialty: "Tile",
      description: "Dramatic oversized porcelain slabs in deep charcoal with minimal grout lines for bold visual impact.",
    },
    floors: {
      name: "Black Marble Tile",
      finish: "Polished Nero Marquina",
      costPerSqFt: { low: 25, high: 65 },
      specialty: "Tile",
      description: "Luxurious black marble with white veining, polished to a high shine for dramatic contrast.",
    },
    fixtures: {
      name: "Sculptural Matte Black Tub",
      finish: "Solid surface matte black",
      costPerSqFt: { low: 0, high: 0, unit: "$5,000 - $12,000" },
      specialty: "Bathroom",
      description: "Statement freestanding tub in matte black finish, creating a dramatic focal point.",
    },
    countertops: {
      name: "Calacatta & Black Contrast Vanity",
      finish: "White marble top with black base",
      costPerSqFt: { low: 95, high: 220 },
      specialty: "Bathroom",
      description: "High-contrast floating vanity with polished Calacatta marble countertop and matte black cabinetry.",
    },
    lighting: {
      name: "Dramatic LED Accent System",
      finish: "Strategic spotlights with LED strips",
      costPerSqFt: { low: 0, high: 0, unit: "$1,200 - $3,500 complete" },
      specialty: "Bathroom",
      description: "Moody layered lighting with focused spotlights, under-floating LED strips, and oversized backlit mirror.",
    },
  },
  "Seamless Microcement": {
    walls: {
      name: "Microcement Wall Finish",
      finish: "Seamless matte in warm gray",
      costPerSqFt: { low: 14, high: 35 },
      specialty: "Microcement",
      description: "Hand-applied microcement creating perfectly seamless walls with zero grout lines and soft tactile texture.",
    },
    floors: {
      name: "Microcement Floor System",
      finish: "Continuous matte with anti-slip seal",
      costPerSqFt: { low: 16, high: 40 },
      specialty: "Microcement",
      description: "Curbless shower-to-floor continuous microcement surface with waterproof membrane and subtle texture.",
    },
    fixtures: {
      name: "Integrated Wall-Mount Suite",
      finish: "Matte white ceramic wall-hung",
      costPerSqFt: { low: 0, high: 0, unit: "$2,500 - $5,500 complete" },
      specialty: "Bathroom",
      description: "Wall-mounted toilet and bidet with concealed tanks, maintaining the seamless minimal aesthetic.",
    },
    countertops: {
      name: "Microcement Integrated Vanity",
      finish: "Continuous surface with molded sink",
      costPerSqFt: { low: 90, high: 200 },
      specialty: "Microcement",
      description: "Custom microcement vanity with seamlessly integrated sink basin - one continuous sculptural form.",
    },
    lighting: {
      name: "Recessed Minimal Lighting",
      finish: "Trimless LED with indirect glow",
      costPerSqFt: { low: 0, high: 0, unit: "$600 - $1,800 complete" },
      specialty: "Bathroom",
      description: "Invisible trimless recessed fixtures and cove lighting for soft, indirect illumination.",
    },
  },
  // Kitchen styles
  "Modern Spa-Inspired Renovation": {
    walls: {
      name: "Herringbone Backsplash",
      finish: "Glazed ceramic",
      costPerSqFt: { low: 15, high: 40 },
      specialty: "Tile",
      description: "Classic herringbone pattern in contemporary colors for timeless appeal.",
    },
    floors: {
      name: "Engineered Hardwood",
      finish: "Wire-brushed oak",
      costPerSqFt: { low: 8, high: 20 },
      specialty: "Kitchen",
      description: "Water-resistant engineered wood with textured finish for durability.",
    },
    fixtures: {
      name: "Professional Range",
      finish: "Stainless steel",
      costPerSqFt: { low: 0, high: 0, unit: "$3,000 - $12,000" },
      specialty: "Kitchen",
      description: "Commercial-grade range with multiple burners and convection oven.",
    },
    countertops: {
      name: "Waterfall Quartz Island",
      finish: "Polished white with gray veining",
      costPerSqFt: { low: 75, high: 180 },
      specialty: "Kitchen",
      description: "Dramatic waterfall edge island with built-in seating and storage.",
    },
    lighting: {
      name: "Pendant Cluster",
      finish: "Brushed brass with glass globes",
      costPerSqFt: { low: 0, high: 0, unit: "$400 - $1,500 per cluster" },
      specialty: "Kitchen",
      description: "Grouped pendant lights at varying heights for visual interest.",
    },
  },
  "Seamless Minimalist Renovation": {
    walls: {
      name: "Handleless Cabinets",
      finish: "Matte lacquer white",
      costPerSqFt: { low: 0, high: 0, unit: "$350 - $800 per linear ft" },
      specialty: "Kitchen",
      description: "Push-to-open cabinets with integrated handles for clean lines.",
    },
    floors: {
      name: "Large Format Porcelain",
      finish: "Concrete-look matte",
      costPerSqFt: { low: 10, high: 25 },
      specialty: "Tile",
      description: "Extra-large tiles with minimal grout lines for seamless appearance.",
    },
    fixtures: {
      name: "Integrated Appliances",
      finish: "Panel-ready",
      costPerSqFt: { low: 0, high: 0, unit: "$5,000 - $15,000 set" },
      specialty: "Kitchen",
      description: "Fully integrated refrigerator and dishwasher behind cabinet panels.",
    },
    countertops: {
      name: "Ultra-Thin Dekton",
      finish: "Matte charcoal",
      costPerSqFt: { low: 85, high: 200 },
      specialty: "Kitchen",
      description: "Ultra-compact surface with extreme heat and scratch resistance.",
    },
    lighting: {
      name: "Under-Cabinet LED Strip",
      finish: "Warm white continuous",
      costPerSqFt: { low: 0, high: 0, unit: "$50 - $150 per linear ft" },
      specialty: "Kitchen",
      description: "Seamless LED strips for task lighting and ambient glow.",
    },
  },
  // Pool Deck styles
  "Modern Spa Renovation (Pool)": {
    walls: {
      name: "Glass Pool Fence",
      finish: "Frameless tempered glass",
      costPerSqFt: { low: 0, high: 0, unit: "$200 - $600 per linear ft" },
      specialty: "Pool Deck",
      description: "Safety fencing with unobstructed views and brushed steel hardware.",
    },
    floors: {
      name: "Travertine Pavers",
      finish: "Tumbled natural stone",
      costPerSqFt: { low: 15, high: 35 },
      specialty: "Pool Deck",
      description: "Cool-to-touch natural stone pavers with non-slip surface texture.",
    },
    fixtures: {
      name: "Infinity Edge Pool",
      finish: "Glass tile interior",
      costPerSqFt: { low: 0, high: 0, unit: "$80,000 - $150,000" },
      specialty: "Pool Deck",
      description: "Vanishing edge pool with premium glass mosaic tile interior.",
    },
    countertops: {
      name: "Outdoor Kitchen Island",
      finish: "Granite with stainless steel",
      costPerSqFt: { low: 0, high: 0, unit: "$8,000 - $25,000" },
      specialty: "Pool Deck",
      description: "Built-in grill, sink, and refrigerator with weather-resistant finishes.",
    },
    lighting: {
      name: "LED Pool Lighting",
      finish: "Color-changing underwater",
      costPerSqFt: { low: 0, high: 0, unit: "$1,500 - $4,000" },
      specialty: "Pool Deck",
      description: "Programmable LED lights in pool and surrounding landscape areas.",
    },
  },
  "Luxury Tile Renovation (Pool)": {
    walls: {
      name: "Stacked Stone Wall",
      finish: "Natural ledgestone",
      costPerSqFt: { low: 20, high: 45 },
      specialty: "Pool Deck",
      description: "Decorative stone veneer for privacy walls and water features.",
    },
    floors: {
      name: "Geometric Concrete Pavers",
      finish: "Textured slip-resistant",
      costPerSqFt: { low: 12, high: 28 },
      specialty: "Pool Deck",
      description: "Modern geometric paver pattern with integrated drainage system.",
    },
    fixtures: {
      name: "Rectangular Pool with LED",
      finish: "Pebble Tec with fiber optics",
      costPerSqFt: { low: 0, high: 0, unit: "$60,000 - $120,000" },
      specialty: "Pool Deck",
      description: "Contemporary pool design with fiber optic lighting and LED features.",
    },
    countertops: {
      name: "Raised Planters",
      finish: "Poured concrete with waterproofing",
      costPerSqFt: { low: 0, high: 0, unit: "$150 - $400 per linear ft" },
      specialty: "Pool Deck",
      description: "Architectural planters with built-in irrigation and drainage.",
    },
    lighting: {
      name: "Landscape Lighting",
      finish: "Bronze path lights",
      costPerSqFt: { low: 0, high: 0, unit: "$2,500 - $8,000" },
      specialty: "Pool Deck",
      description: "Professional landscape lighting with uplights and path markers.",
    },
  },
  "Seamless Natural Stone Renovation": {
    walls: {
      name: "Boulder Water Feature",
      finish: "Natural river rock",
      costPerSqFt: { low: 0, high: 0, unit: "$5,000 - $15,000" },
      specialty: "Pool Deck",
      description: "Custom boulder arrangement with cascading water feature.",
    },
    floors: {
      name: "Flagstone Pavers",
      finish: "Irregular natural cut",
      costPerSqFt: { low: 18, high: 40 },
      specialty: "Pool Deck",
      description: "Natural flagstone with organic patterns and earth tones.",
    },
    fixtures: {
      name: "Freeform Pool with Waterfall",
      finish: "Pebble interior with rock grotto",
      costPerSqFt: { low: 0, high: 0, unit: "$75,000 - $180,000" },
      specialty: "Pool Deck",
      description: "Lagoon-style pool with natural rock waterfall and grotto.",
    },
    countertops: {
      name: "Stone Fire Pit",
      finish: "Stacked natural stone",
      costPerSqFt: { low: 0, high: 0, unit: "$3,000 - $12,000" },
      specialty: "Pool Deck",
      description: "Gas or wood-burning fire pit surrounded by natural stone seating.",
    },
    lighting: {
      name: "Tiki Torch & Ambient",
      finish: "Copper with natural gas",
      costPerSqFt: { low: 0, high: 0, unit: "$1,500 - $5,000" },
      specialty: "Pool Deck",
      description: "Permanent tiki torches with gas lines and ambient string lights.",
    },
  },
  // Patio styles
  "Modern Outdoor Living Renovation": {
    walls: {
      name: "Aluminum Pergola",
      finish: "Powder-coated with motorized louvers",
      costPerSqFt: { low: 0, high: 0, unit: "$15,000 - $40,000" },
      specialty: "Patio",
      description: "Adjustable louvered pergola for sun and rain control.",
    },
    floors: {
      name: "Composite Decking",
      finish: "Wood-grain textured",
      costPerSqFt: { low: 12, high: 28 },
      specialty: "Patio",
      description: "Low-maintenance composite with hidden fastener system.",
    },
    fixtures: {
      name: "Outdoor TV & Sound",
      finish: "Weatherproof with surround sound",
      costPerSqFt: { low: 0, high: 0, unit: "$5,000 - $15,000" },
      specialty: "Patio",
      description: "All-weather TV with integrated outdoor speaker system.",
    },
    countertops: {
      name: "Built-In L-Shaped Sofa",
      finish: "Concrete base with all-weather cushions",
      costPerSqFt: { low: 0, high: 0, unit: "$6,000 - $20,000" },
      specialty: "Patio",
      description: "Permanent seating with storage and premium outdoor fabric.",
    },
    lighting: {
      name: "String Lights & Ceiling Fan",
      finish: "Edison bulbs with matte black fan",
      costPerSqFt: { low: 0, high: 0, unit: "$800 - $3,000" },
      specialty: "Patio",
      description: "Ambient string lighting with wet-rated ceiling fans.",
    },
  },
  "Mediterranean Courtyard Renovation": {
    walls: {
      name: "Arched Pergola",
      finish: "Stucco columns with wood beams",
      costPerSqFt: { low: 0, high: 0, unit: "$12,000 - $35,000" },
      specialty: "Patio",
      description: "Mediterranean-style arched structure with climbing vine support.",
    },
    floors: {
      name: "Terracotta Tile",
      finish: "Saltillo hand-made",
      costPerSqFt: { low: 10, high: 25 },
      specialty: "Tile",
      description: "Authentic Mexican terracotta tiles with rustic imperfections.",
    },
    fixtures: {
      name: "Tiered Fountain",
      finish: "Cast stone with aged patina",
      costPerSqFt: { low: 0, high: 0, unit: "$2,500 - $10,000" },
      specialty: "Patio",
      description: "Central courtyard fountain with recirculating pump system.",
    },
    countertops: {
      name: "Wrought Iron Dining Set",
      finish: "Hand-forged with mosaic table",
      costPerSqFt: { low: 0, high: 0, unit: "$2,000 - $8,000" },
      specialty: "Patio",
      description: "Traditional wrought iron furniture with ceramic tile tabletop.",
    },
    lighting: {
      name: "Iron Lanterns",
      finish: "Aged bronze with seeded glass",
      costPerSqFt: { low: 0, high: 0, unit: "$1,000 - $4,000" },
      specialty: "Patio",
      description: "Hanging and wall-mounted lanterns with warm LED bulbs.",
    },
  },
  "Modern Rooftop Renovation": {
    walls: {
      name: "Planter Privacy Wall",
      finish: "Cor-ten steel with integrated planters",
      costPerSqFt: { low: 0, high: 0, unit: "$200 - $500 per linear ft" },
      specialty: "Patio",
      description: "Modern privacy screens with built-in planter boxes.",
    },
    floors: {
      name: "Porcelain Pavers on Pedestal",
      finish: "Wood-look with adjustable supports",
      costPerSqFt: { low: 15, high: 35 },
      specialty: "Tile",
      description: "Elevated paver system for drainage and rooftop protection.",
    },
    fixtures: {
      name: "Modular Sectional",
      finish: "Aluminum frame with Sunbrella fabric",
      costPerSqFt: { low: 0, high: 0, unit: "$4,000 - $15,000" },
      specialty: "Patio",
      description: "Configurable outdoor sectional with quick-dry cushions.",
    },
    countertops: {
      name: "Outdoor Bar with Sink",
      finish: "Stainless steel with quartz top",
      costPerSqFt: { low: 0, high: 0, unit: "$5,000 - $18,000" },
      specialty: "Patio",
      description: "Compact outdoor bar with running water and storage.",
    },
    lighting: {
      name: "Recessed Deck Lights",
      finish: "Flush-mount LED",
      costPerSqFt: { low: 0, high: 0, unit: "$1,500 - $5,000" },
      specialty: "Patio",
      description: "Low-profile deck lights with step and accent lighting.",
    },
  },
};

// Fallback materials for styles not specifically mapped
const DEFAULT_MATERIALS = {
  walls: {
    name: "Premium Wall Finish",
    finish: "Designer selection",
    costPerSqFt: { low: 12, high: 35 },
    specialty: "Bathroom",
    description: "High-quality wall treatment selected for this renovation style.",
  },
  floors: {
    name: "Designer Flooring",
    finish: "Style-matched",
    costPerSqFt: { low: 10, high: 30 },
    specialty: "Tile",
    description: "Durable flooring material selected to complement the overall design.",
  },
  fixtures: {
    name: "Modern Fixtures",
    finish: "Contemporary",
    costPerSqFt: { low: 0, high: 0, unit: "$1,500 - $5,000" },
    specialty: "Bathroom",
    description: "Updated fixtures to complete the renovation look.",
  },
  countertops: {
    name: "Quality Surfaces",
    finish: "Polished or matte",
    costPerSqFt: { low: 50, high: 150 },
    specialty: "Kitchen",
    description: "Durable countertop material for daily use.",
  },
  lighting: {
    name: "Modern Lighting",
    finish: "Designer selection",
    costPerSqFt: { low: 0, high: 0, unit: "$200 - $800 per fixture" },
    specialty: "Bathroom",
    description: "Contemporary lighting fixtures for optimal illumination.",
  },
};

const MaterialZone = ({ zone, isActive, onClick }) => {
  const { bounds } = zone;
  
  return (
    <button
      onClick={onClick}
      className={`absolute transition-all duration-300 rounded-lg border-2 ${
        isActive 
          ? "border-[#D97757] bg-[#D97757]/20 shadow-lg" 
          : "border-transparent hover:border-white/50 hover:bg-white/10"
      }`}
      style={{
        top: `${bounds.top}%`,
        left: `${bounds.left}%`,
        width: `${bounds.width}%`,
        height: `${bounds.height}%`,
      }}
      data-testid={`material-zone-${zone.id}`}
    >
      <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl transition-transform duration-200 ${
        isActive ? "scale-125" : "scale-100 opacity-70 hover:opacity-100"
      }`}>
        {zone.icon}
      </span>
      <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap transition-opacity duration-200 ${
        isActive 
          ? "bg-[#D97757] text-white opacity-100" 
          : "bg-black/50 text-white opacity-0 group-hover:opacity-100"
      }`}>
        {zone.label}
      </span>
    </button>
  );
};

const MaterialPanel = ({ material, zone, contractors, onClose, onRequestQuote, onSaveMaterialsList }) => {
  if (!material) return null;

  const matchingContractors = contractors.filter(c => 
    c.specialties?.some(s => 
      s.toLowerCase().includes(material.specialty.toLowerCase()) ||
      material.specialty.toLowerCase().includes(s.toLowerCase())
    )
  );

  const formatCost = () => {
    if (material.costPerSqFt.unit) {
      return material.costPerSqFt.unit;
    }
    return `$${material.costPerSqFt.low} - $${material.costPerSqFt.high} per sq ft installed`;
  };

  return (
    <div 
      className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in-right"
      data-testid="material-panel"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border/40 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{zone.icon}</span>
          <div>
            <p className="text-xs text-[#D97757] font-semibold uppercase tracking-wide">{zone.label}</p>
            <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
              {material.name}
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          data-testid="close-material-panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Material Details */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Layers className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Finish Type</p>
              <p className="text-sm text-muted-foreground">{material.finish}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Estimated Cost</p>
              <p className="text-sm text-muted-foreground">{formatCost()}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Hammer className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Specialty Trade</p>
              <Badge variant="secondary" className="mt-1">{material.specialty}</Badge>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed pt-2 border-t border-border/40">
            {material.description}
          </p>
        </div>

        {/* Save Materials List Button */}
        <Button
          onClick={onSaveMaterialsList}
          variant="outline"
          className="w-full rounded-full border-primary text-primary hover:bg-primary/5"
          data-testid="save-materials-list-panel-btn"
        >
          <FileDown className="w-4 h-4 mr-2" />
          Save All Materials as PDF
        </Button>

        {/* Matching Contractors */}
        {matchingContractors.length > 0 && (
          <div className="pt-4 border-t border-border/40">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#D97757]" />
              <h4 className="font-semibold text-foreground">
                {material.specialty} Specialists Near You
              </h4>
            </div>

            <div className="space-y-3">
              {matchingContractors.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className="bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors"
                  data-testid={`material-contractor-${c.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-medium text-foreground text-sm">{c.company_name}</h5>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.round(c.rating || 0) ? "fill-[#D97757] text-[#D97757]" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({c.review_count})
                        </span>
                      </div>
                    </div>
                    {c.distance_miles > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {c.distance_miles} mi
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {c.specialties?.slice(0, 3).map((s) => (
                      <Badge 
                        key={s} 
                        variant="secondary" 
                        className={`text-xs ${
                          s.toLowerCase().includes(material.specialty.toLowerCase()) 
                            ? "bg-[#D97757]/10 text-[#D97757]" 
                            : ""
                        }`}
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>

                  {c.phone && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <Phone className="w-3 h-3" />
                      {c.phone}
                    </div>
                  )}

                  <Button
                    onClick={() => onRequestQuote(c)}
                    size="sm"
                    className="w-full rounded-full bg-primary text-primary-foreground text-xs h-8"
                    data-testid={`material-quote-btn-${c.id}`}
                  >
                    Request {material.specialty} Quote
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>

            {matchingContractors.length > 3 && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                +{matchingContractors.length - 3} more {material.specialty.toLowerCase()} specialists nearby
              </p>
            )}
          </div>
        )}

        {matchingContractors.length === 0 && (
          <div className="pt-4 border-t border-border/40 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              No {material.specialty.toLowerCase()} specialists found in your area yet.
            </p>
            <Button
              onClick={() => onRequestQuote(null)}
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              data-testid="general-material-quote-btn"
            >
              Request General Quote
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const MaterialExplorer = ({ 
  designImage, 
  designName, 
  contractors = [],
  onRequestQuote,
  onSaveMaterialsList,
  isVisible = true 
}) => {
  const [activeZone, setActiveZone] = useState(null);
  const [showPanel, setShowPanel] = useState(false);

  // Get materials for this design style
  const getMaterials = () => {
    // Try exact match first
    if (STYLE_MATERIALS[designName]) {
      return STYLE_MATERIALS[designName];
    }
    // Try partial match
    for (const styleName of Object.keys(STYLE_MATERIALS)) {
      if (designName.toLowerCase().includes(styleName.toLowerCase().split(" ")[0])) {
        return STYLE_MATERIALS[styleName];
      }
    }
    return DEFAULT_MATERIALS;
  };

  const materials = getMaterials();

  const handleZoneClick = (zoneId) => {
    setActiveZone(zoneId);
    setShowPanel(true);
  };

  const handleClosePanel = () => {
    setShowPanel(false);
    setTimeout(() => setActiveZone(null), 300);
  };

  if (!isVisible) return null;

  const activeMaterial = activeZone ? materials[activeZone] : null;
  const activeZoneData = activeZone ? MATERIAL_ZONES[activeZone] : null;

  return (
    <>
      {/* Interactive overlay on the design image */}
      <div className="absolute inset-0 z-10" data-testid="material-explorer">
        {/* Instruction hint */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm z-20">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3 h-3" />
            Click zones to explore materials
          </span>
        </div>

        {/* Material zones */}
        {Object.values(MATERIAL_ZONES).map((zone) => (
          <MaterialZone
            key={zone.id}
            zone={zone}
            isActive={activeZone === zone.id}
            onClick={() => handleZoneClick(zone.id)}
          />
        ))}
      </div>

      {/* Backdrop */}
      {showPanel && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 animate-fade-in"
          onClick={handleClosePanel}
          data-testid="material-panel-backdrop"
        />
      )}

      {/* Material detail panel */}
      {showPanel && activeMaterial && activeZoneData && (
        <MaterialPanel
          material={activeMaterial}
          zone={activeZoneData}
          contractors={contractors}
          onClose={handleClosePanel}
          onRequestQuote={(contractor) => {
            handleClosePanel();
            onRequestQuote(contractor);
          }}
          onSaveMaterialsList={() => {
            handleClosePanel();
            onSaveMaterialsList();
          }}
        />
      )}
    </>
  );
};

export default MaterialExplorer;
