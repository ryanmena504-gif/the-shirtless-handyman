import { useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { 
  FileDown, X, Ruler, Calculator, Building2, Phone, Mail 
} from "lucide-react";

// Material data mapped by renovation style and zone (same as MaterialExplorer)
const STYLE_MATERIALS = {
  "Modern Luxury Spa": {
    walls: { name: "Honed Travertine Stone", finish: "Natural matte with filled veins", costPerSqFt: { low: 18, high: 45 }, specialty: "Tile" },
    floors: { name: "Heated Limestone Tile", finish: "Tumbled natural stone with radiant heat", costPerSqFt: { low: 20, high: 50 }, specialty: "Tile" },
    fixtures: { name: "Freestanding Soaking Tub", finish: "Matte white solid surface", costPerSqFt: { unit: "$3,500 - $8,000" }, specialty: "Bathroom" },
    countertops: { name: "Teak Wood Vanity", finish: "Natural oiled teak with waterproof seal", costPerSqFt: { low: 85, high: 200 }, specialty: "Bathroom" },
    lighting: { name: "Warm Ambient LED System", finish: "2700K dimmable with backlit mirror", costPerSqFt: { unit: "$800 - $2,500 complete" }, specialty: "Bathroom" },
  },
  "Bold Contemporary": {
    walls: { name: "Charcoal Porcelain Slab", finish: "Matte black large format", costPerSqFt: { low: 22, high: 55 }, specialty: "Tile" },
    floors: { name: "Black Marble Tile", finish: "Polished Nero Marquina", costPerSqFt: { low: 25, high: 65 }, specialty: "Tile" },
    fixtures: { name: "Sculptural Matte Black Tub", finish: "Solid surface matte black", costPerSqFt: { unit: "$5,000 - $12,000" }, specialty: "Bathroom" },
    countertops: { name: "Calacatta & Black Contrast Vanity", finish: "White marble top with black base", costPerSqFt: { low: 95, high: 220 }, specialty: "Bathroom" },
    lighting: { name: "Dramatic LED Accent System", finish: "Strategic spotlights with LED strips", costPerSqFt: { unit: "$1,200 - $3,500 complete" }, specialty: "Bathroom" },
  },
  "Seamless Microcement": {
    walls: { name: "Microcement Wall Finish", finish: "Seamless matte in warm gray", costPerSqFt: { low: 14, high: 35 }, specialty: "Microcement" },
    floors: { name: "Microcement Floor System", finish: "Continuous matte with anti-slip seal", costPerSqFt: { low: 16, high: 40 }, specialty: "Microcement" },
    fixtures: { name: "Integrated Wall-Mount Suite", finish: "Matte white ceramic wall-hung", costPerSqFt: { unit: "$2,500 - $5,500 complete" }, specialty: "Bathroom" },
    countertops: { name: "Microcement Integrated Vanity", finish: "Continuous surface with molded sink", costPerSqFt: { low: 90, high: 200 }, specialty: "Microcement" },
    lighting: { name: "Recessed Minimal Lighting", finish: "Trimless LED with indirect glow", costPerSqFt: { unit: "$600 - $1,800 complete" }, specialty: "Bathroom" },
  },
};

// Default materials for unknown styles
const DEFAULT_MATERIALS = {
  walls: { name: "Premium Wall Finish", finish: "Designer selection", costPerSqFt: { low: 12, high: 35 }, specialty: "General" },
  floors: { name: "Designer Flooring", finish: "Style-matched", costPerSqFt: { low: 10, high: 30 }, specialty: "Flooring" },
  fixtures: { name: "Modern Fixtures", finish: "Contemporary", costPerSqFt: { unit: "$1,500 - $5,000" }, specialty: "General" },
  countertops: { name: "Quality Surfaces", finish: "Polished or matte", costPerSqFt: { low: 50, high: 150 }, specialty: "Surfaces" },
  lighting: { name: "Modern Lighting", finish: "Designer selection", costPerSqFt: { unit: "$200 - $800 per fixture" }, specialty: "Electrical" },
};

const ZONE_LABELS = {
  walls: "Walls",
  floors: "Flooring",
  fixtures: "Fixtures",
  countertops: "Countertops & Surfaces",
  lighting: "Lighting",
};

// PDF brand colors (R,G,B)
const PRIMARY_RGB = [26, 60, 52];   // Deep Jungle Green
const ACCENT_RGB = [217, 119, 87];  // Terracotta

function calcQuantitiesFromDimensions({ length, width, height }) {
  const l = parseFloat(length) || 0;
  const w = parseFloat(width) || 0;
  const h = parseFloat(height) || 8;
  return {
    floorSqFt: l * w,
    wallSqFt: 2 * (l + w) * h,
    countertopSqFt: Math.min(l * 3, 30),
  };
}

function renderPdfHeader(doc, pageWidth) {
  doc.setFillColor(...PRIMARY_RGB);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("The Shirtless Handyman", 20, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Materials Shopping List", 20, 28);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 50, 20);
}

function renderProjectDetails(doc, { designName, projectType, zipCode, dimensions, quantities }) {
  let y = 50;
  doc.setTextColor(...PRIMARY_RGB);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Project Details", 20, y);
  y += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(`Design Style: ${designName || "Custom Design"}`, 20, y);
  y += 6;
  doc.text(`Room Type: ${projectType || "N/A"}`, 20, y);
  y += 6;
  doc.text(`Location: ZIP ${zipCode || "N/A"}`, 20, y);
  if (dimensions.length && dimensions.width) {
    y += 6;
    doc.text(`Room Dimensions: ${dimensions.length}' × ${dimensions.width}' × ${dimensions.height || 8}'`, 20, y);
    y += 6;
    doc.text(`Floor Area: ${quantities.floorSqFt.toFixed(0)} sq ft | Wall Area: ${quantities.wallSqFt.toFixed(0)} sq ft`, 20, y);
  }
  return y;
}

function computeZoneCost(zone, mat, quantities) {
  if (mat.costPerSqFt.unit) {
    return { text: mat.costPerSqFt.unit, low: 0, high: 0 };
  }
  const sqFtByZone = {
    floors: quantities.floorSqFt,
    walls: quantities.wallSqFt,
    countertops: quantities.countertopSqFt,
  };
  const sqFt = sqFtByZone[zone] ?? quantities.floorSqFt * 0.1;
  if (sqFt <= 0) {
    return {
      text: `$${mat.costPerSqFt.low} - $${mat.costPerSqFt.high}/sqft`,
      low: 0,
      high: 0,
    };
  }
  const low = mat.costPerSqFt.low * sqFt;
  const high = mat.costPerSqFt.high * sqFt;
  return { text: `$${low.toFixed(0)} - $${high.toFixed(0)}`, low, high };
}

function renderMaterialsTable(doc, materials, pageWidth, startY, quantities) {
  let y = startY + 15;
  doc.setFillColor(...ACCENT_RGB);
  doc.rect(20, y, pageWidth - 40, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Zone", 25, y + 6);
  doc.text("Material", 55, y + 6);
  doc.text("Finish", 105, y + 6);
  doc.text("Est. Cost", 155, y + 6);

  y += 12;
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");

  let totalLow = 0;
  let totalHigh = 0;
  Object.entries(materials).forEach(([zone, mat], index) => {
    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(20, y - 4, pageWidth - 40, 12, "F");
    }
    doc.setFontSize(9);
    doc.text(ZONE_LABELS[zone] || zone, 25, y + 2);
    doc.text(mat.name.substring(0, 25), 55, y + 2);
    doc.text(mat.finish.substring(0, 25), 105, y + 2);
    const { text, low, high } = computeZoneCost(zone, mat, quantities);
    totalLow += low;
    totalHigh += high;
    doc.text(text, 155, y + 2);
    y += 12;
  });

  if (totalLow > 0) {
    y += 5;
    doc.setFillColor(...PRIMARY_RGB);
    doc.rect(20, y - 4, pageWidth - 40, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("ESTIMATED MATERIALS TOTAL", 25, y + 3);
    doc.text(`$${totalLow.toFixed(0)} - $${totalHigh.toFixed(0)}`, 155, y + 3);
  }
  return y;
}

function renderContractorSection(doc, contractor, startY) {
  if (!contractor) return startY;
  let y = startY + 25;
  doc.setTextColor(...ACCENT_RGB);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Recommended Contractor", 20, y);
  y += 10;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(contractor.company_name, 20, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  if (contractor.phone) {
    doc.text(`Phone: ${contractor.phone}`, 20, y);
    y += 6;
  }
  if (contractor.email) {
    doc.text(`Email: ${contractor.email}`, 20, y);
    y += 6;
  }
  if (contractor.specialties?.length) {
    doc.text(`Specialties: ${contractor.specialties.join(", ")}`, 20, y);
  }
  return y;
}

function renderQuoteSection(doc, pageWidth, startY) {
  const y = startY + 25;
  doc.setDrawColor(...PRIMARY_RGB);
  doc.setLineWidth(0.5);
  doc.rect(20, y, pageWidth - 40, 40);
  doc.setTextColor(...PRIMARY_RGB);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Contractor Quote Section", 25, y + 8);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Quote Amount: $________________", 25, y + 18);
  doc.text("Labor: $________________", 25, y + 26);
  doc.text("Materials: $________________", 100, y + 26);
  doc.text("Timeline: ________________ weeks", 25, y + 34);
  doc.text("Valid Until: ________________", 100, y + 34);
}

function renderFooter(doc, pageWidth) {
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFillColor(245, 245, 245);
  doc.rect(0, footerY - 5, pageWidth, 20, "F");
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.text(
    "Generated by The Shirtless Handyman - Seamless Surface Renovations",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  doc.text(
    "Costs are estimates only. Actual prices may vary based on location, supplier, and project specifics.",
    pageWidth / 2,
    footerY + 5,
    { align: "center" }
  );
}

const MaterialsListPDF = ({
  designName,
  projectType,
  zipCode,
  contractor = null,
  isOpen,
  onClose,
}) => {
  const [dimensions, setDimensions] = useState({ length: "", width: "", height: "" });
  const [generating, setGenerating] = useState(false);

  // Get materials for this design style
  const getMaterials = () => {
    if (STYLE_MATERIALS[designName]) return STYLE_MATERIALS[designName];
    for (const styleName of Object.keys(STYLE_MATERIALS)) {
      if (designName?.toLowerCase().includes(styleName.toLowerCase().split(" ")[0])) {
        return STYLE_MATERIALS[styleName];
      }
    }
    return DEFAULT_MATERIALS;
  };

  const materials = getMaterials();

  const generatePDF = () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const quantities = calcQuantitiesFromDimensions(dimensions);

      renderPdfHeader(doc, pageWidth);
      const afterDetailsY = renderProjectDetails(doc, {
        designName, projectType, zipCode, dimensions, quantities,
      });
      const afterTableY = renderMaterialsTable(doc, materials, pageWidth, afterDetailsY, quantities);
      const afterContractorY = renderContractorSection(doc, contractor, afterTableY);
      renderQuoteSection(doc, pageWidth, afterContractorY);
      renderFooter(doc, pageWidth);

      const fileName = `SeamlessBath_Materials_${projectType?.replace(/\s+/g, "_") || "Project"}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch {
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white rounded-2xl shadow-2xl z-50 animate-scale-in overflow-hidden"
        data-testid="materials-pdf-modal"
      >
        {/* Header */}
        <div className="bg-primary p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileDown className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'Fraunces', serif" }}>
              Save Materials List
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            data-testid="close-pdf-modal"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Design Info */}
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Design Style</p>
            <p className="font-medium text-foreground">{designName || "Custom Design"}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {projectType} • ZIP {zipCode}
            </p>
          </div>
          
          {/* Room Dimensions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Room Dimensions (feet)</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter dimensions to calculate material quantities and total costs
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Length</Label>
                <Input
                  type="number"
                  placeholder="12"
                  value={dimensions.length}
                  onChange={(e) => setDimensions(d => ({ ...d, length: e.target.value }))}
                  className="h-10"
                  data-testid="dimension-length"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Width</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={dimensions.width}
                  onChange={(e) => setDimensions(d => ({ ...d, width: e.target.value }))}
                  className="h-10"
                  data-testid="dimension-width"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Height</Label>
                <Input
                  type="number"
                  placeholder="8"
                  value={dimensions.height}
                  onChange={(e) => setDimensions(d => ({ ...d, height: e.target.value }))}
                  className="h-10"
                  data-testid="dimension-height"
                />
              </div>
            </div>
          </div>
          
          {/* Quick Calculations Preview */}
          {dimensions.length && dimensions.width && (
            <div className="bg-primary/5 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Calculator className="w-4 h-4" />
                Calculated Areas
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <span>Floor: {(parseFloat(dimensions.length) * parseFloat(dimensions.width)).toFixed(0)} sq ft</span>
                <span>Walls: {(2 * (parseFloat(dimensions.length) + parseFloat(dimensions.width)) * (parseFloat(dimensions.height) || 8)).toFixed(0)} sq ft</span>
              </div>
            </div>
          )}
          
          {/* Contractor Info */}
          {contractor && (
            <div className="bg-[#D97757]/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#D97757] mb-2">
                <Building2 className="w-4 h-4" />
                Selected Contractor
              </div>
              <p className="font-medium text-foreground">{contractor.company_name}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                {contractor.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {contractor.phone}
                  </span>
                )}
                {contractor.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {contractor.email}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* PDF includes */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Your PDF will include:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Material names, finishes & estimated costs</li>
              <li>Calculated quantities based on room size</li>
              <li>Contractor contact info (if selected)</li>
              <li>Quote request section for contractors</li>
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-border/40 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={generatePDF}
            disabled={generating}
            className="flex-1 rounded-full bg-primary text-white"
            data-testid="generate-pdf-btn"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FileDown className="w-4 h-4" />
                Download PDF
              </span>
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default MaterialsListPDF;
