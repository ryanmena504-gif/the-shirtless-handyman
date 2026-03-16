import { useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  FileDown, X, Ruler, Calculator, Building2, Phone, Mail 
} from "lucide-react";

// Material data mapped by renovation style and zone (same as MaterialExplorer)
const STYLE_MATERIALS = {
  "Modern Spa Renovation": {
    walls: { name: "Natural Stone Tile", finish: "Honed matte", costPerSqFt: { low: 15, high: 35 }, specialty: "Tile" },
    floors: { name: "Heated Porcelain Tile", finish: "Textured slip-resistant", costPerSqFt: { low: 12, high: 28 }, specialty: "Tile" },
    fixtures: { name: "Freestanding Soaking Tub", finish: "Matte white acrylic", costPerSqFt: { unit: "$2,500 - $6,000" }, specialty: "Bathroom" },
    countertops: { name: "Floating Wood Vanity", finish: "Natural oak with waterproof seal", costPerSqFt: { low: 45, high: 120 }, specialty: "Kitchen" },
    lighting: { name: "Recessed LED Lighting", finish: "Warm white 2700K", costPerSqFt: { unit: "$150 - $400 per fixture" }, specialty: "Bathroom" },
  },
  "Luxury Tile Renovation": {
    walls: { name: "Marble-Look Porcelain", finish: "Polished glazed", costPerSqFt: { low: 18, high: 45 }, specialty: "Tile" },
    floors: { name: "Mosaic Accent Tile", finish: "Mixed polished & matte", costPerSqFt: { low: 20, high: 55 }, specialty: "Tile" },
    fixtures: { name: "Frameless Glass Shower", finish: "Clear tempered glass with brushed gold hardware", costPerSqFt: { unit: "$1,800 - $4,500" }, specialty: "Shower" },
    countertops: { name: "Quartz Countertop", finish: "Polished Calacatta", costPerSqFt: { low: 65, high: 150 }, specialty: "Kitchen" },
    lighting: { name: "Crystal Pendant Lights", finish: "Brushed gold with clear crystals", costPerSqFt: { unit: "$300 - $1,200 per fixture" }, specialty: "Bathroom" },
  },
  "Seamless Microcement Renovation": {
    walls: { name: "Microcement", finish: "Seamless matte concrete", costPerSqFt: { low: 12, high: 30 }, specialty: "Microcement" },
    floors: { name: "Microcement Floor", finish: "Sealed matte with anti-slip", costPerSqFt: { low: 14, high: 35 }, specialty: "Microcement" },
    fixtures: { name: "Wall-Mounted Toilet", finish: "Matte white ceramic", costPerSqFt: { unit: "$800 - $2,000" }, specialty: "Bathroom" },
    countertops: { name: "Concrete Vanity Top", finish: "Sealed natural gray", costPerSqFt: { low: 75, high: 175 }, specialty: "Kitchen" },
    lighting: { name: "Industrial Pendant", finish: "Matte black metal", costPerSqFt: { unit: "$200 - $600 per fixture" }, specialty: "Bathroom" },
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

const MaterialsListPDF = ({ 
  designName, 
  projectType,
  zipCode,
  contractor = null,
  isOpen,
  onClose 
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

  const calculateQuantities = () => {
    const l = parseFloat(dimensions.length) || 0;
    const w = parseFloat(dimensions.width) || 0;
    const h = parseFloat(dimensions.height) || 8;

    const floorSqFt = l * w;
    const wallSqFt = 2 * (l + w) * h;
    const countertopSqFt = Math.min(l * 3, 30); // Estimate counter space

    return { floorSqFt, wallSqFt, countertopSqFt };
  };

  const generatePDF = () => {
    setGenerating(true);
    
    try {
      const doc = new jsPDF();
      const quantities = calculateQuantities();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Colors
      const primaryColor = [26, 60, 52]; // Deep Jungle Green
      const accentColor = [217, 119, 87]; // Terracotta
      
      // Header with logo area
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("RenovateAI", 20, 20);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Materials Shopping List", 20, 28);
      
      // Date
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 50, 20);
      
      // Project Info Section
      let y = 50;
      doc.setTextColor(...primaryColor);
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
      
      // Materials Table
      y += 15;
      doc.setFillColor(...accentColor);
      doc.rect(20, y, pageWidth - 40, 8, 'F');
      
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
        // Alternate row backgrounds
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(20, y - 4, pageWidth - 40, 12, 'F');
        }
        
        doc.setFontSize(9);
        doc.text(ZONE_LABELS[zone] || zone, 25, y + 2);
        doc.text(mat.name.substring(0, 25), 55, y + 2);
        doc.text(mat.finish.substring(0, 25), 105, y + 2);
        
        let costText = "";
        let zoneCostLow = 0;
        let zoneCostHigh = 0;
        
        if (mat.costPerSqFt.unit) {
          costText = mat.costPerSqFt.unit;
        } else {
          // Calculate based on zone and dimensions
          let sqFt = 0;
          if (zone === "floors") sqFt = quantities.floorSqFt;
          else if (zone === "walls") sqFt = quantities.wallSqFt;
          else if (zone === "countertops") sqFt = quantities.countertopSqFt;
          else sqFt = quantities.floorSqFt * 0.1; // Estimate for fixtures/lighting
          
          if (sqFt > 0) {
            zoneCostLow = mat.costPerSqFt.low * sqFt;
            zoneCostHigh = mat.costPerSqFt.high * sqFt;
            costText = `$${zoneCostLow.toFixed(0)} - $${zoneCostHigh.toFixed(0)}`;
            totalLow += zoneCostLow;
            totalHigh += zoneCostHigh;
          } else {
            costText = `$${mat.costPerSqFt.low} - $${mat.costPerSqFt.high}/sqft`;
          }
        }
        
        doc.text(costText, 155, y + 2);
        y += 12;
      });
      
      // Total estimate
      if (totalLow > 0) {
        y += 5;
        doc.setFillColor(...primaryColor);
        doc.rect(20, y - 4, pageWidth - 40, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("ESTIMATED MATERIALS TOTAL", 25, y + 3);
        doc.text(`$${totalLow.toFixed(0)} - $${totalHigh.toFixed(0)}`, 155, y + 3);
      }
      
      // Contractor Info Section (if provided)
      if (contractor) {
        y += 25;
        doc.setTextColor(...accentColor);
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
        if (contractor.phone) doc.text(`Phone: ${contractor.phone}`, 20, y);
        y += 6;
        if (contractor.email) doc.text(`Email: ${contractor.email}`, 20, y);
        y += 6;
        if (contractor.specialties?.length) {
          doc.text(`Specialties: ${contractor.specialties.join(", ")}`, 20, y);
        }
      }
      
      // Quote Request Section
      y += 25;
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.rect(20, y, pageWidth - 40, 40);
      
      doc.setTextColor(...primaryColor);
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
      
      // Footer
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFillColor(245, 245, 245);
      doc.rect(0, footerY - 5, pageWidth, 20, 'F');
      
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(8);
      doc.text("Generated by RenovateAI - AI-Powered Home Renovation Visualizer", pageWidth / 2, footerY, { align: "center" });
      doc.text("Costs are estimates only. Actual prices may vary based on location, supplier, and project specifics.", pageWidth / 2, footerY + 5, { align: "center" });
      
      // Save the PDF
      const fileName = `RenovateAI_Materials_${projectType?.replace(/\s+/g, "_") || "Project"}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error("PDF generation error:", error);
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
