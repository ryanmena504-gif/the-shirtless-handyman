import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { 
  Shield, AlertTriangle, Wrench, DollarSign, ChevronRight,
  Droplets, Lightbulb, Layout, Calendar, Paintbrush, 
  Thermometer, Zap, CheckCircle2, Loader2
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Dynamic analysis content based on room type
const ROOM_ANALYSIS_DATA = {
  Bathroom: {
    conditions: [
      { icon: Droplets, text: "Potential moisture exposure around wet areas", severity: "moderate" },
      { icon: Calendar, text: "Fixtures and finishes showing signs of age", severity: "moderate" },
      { icon: Paintbrush, text: "Grout lines and tile joints trapping mold or mildew", severity: "significant" },
      { icon: Layout, text: "Layout may not maximize available space", severity: "minor" },
      { icon: Lightbulb, text: "Lighting insufficient for grooming tasks", severity: "minor" },
    ],
    improvements: [
      { icon: Shield, text: "Apply seamless waterproof micro quartz to all wet zones" },
      { icon: Paintbrush, text: "Replace tiles with continuous microcement — zero grout lines" },
      { icon: Zap, text: "Add layered lighting with dimmers and task lights" },
      { icon: Thermometer, text: "Consider heated flooring under seamless surface" },
      { icon: Wrench, text: "Replace fixtures with premium matte water-efficient models" },
    ],
  },
  Kitchen: {
    conditions: [
      { icon: Calendar, text: "Cabinets showing wear or outdated styling", severity: "moderate" },
      { icon: Paintbrush, text: "Countertops may have stains or surface damage", severity: "moderate" },
      { icon: Layout, text: "Work triangle could be optimized for efficiency", severity: "minor" },
      { icon: Lightbulb, text: "Under-cabinet and task lighting lacking", severity: "minor" },
      { icon: Zap, text: "Appliances may be energy inefficient", severity: "moderate" },
    ],
    improvements: [
      { icon: Wrench, text: "Replace cabinets with modern flat-panel soft-close cabinetry" },
      { icon: Paintbrush, text: "Install seamless microcement countertops and backsplash" },
      { icon: Zap, text: "Upgrade to energy-efficient integrated appliances" },
      { icon: Lightbulb, text: "Add under-cabinet LED lighting and pendant fixtures" },
      { icon: Layout, text: "Reconfigure layout for better workflow" },
    ],
  },
  "Living Room": {
    conditions: [
      { icon: Paintbrush, text: "Wall finishes may need refreshing", severity: "minor" },
      { icon: Lightbulb, text: "Lighting lacks layered ambient and task options", severity: "moderate" },
      { icon: Layout, text: "Furniture arrangement not optimizing space", severity: "minor" },
      { icon: Calendar, text: "Flooring showing wear patterns", severity: "moderate" },
      { icon: Thermometer, text: "Climate control could be improved", severity: "minor" },
    ],
    improvements: [
      { icon: Paintbrush, text: "Apply venetian plaster or microcement accent wall" },
      { icon: Lightbulb, text: "Install dimmable lighting with multiple zones" },
      { icon: Layout, text: "Create defined zones for activities" },
      { icon: Wrench, text: "Install seamless microcement or microterrazzo flooring" },
      { icon: Zap, text: "Add rockscape accent feature wall as focal point" },
    ],
  },
  Bedroom: {
    conditions: [
      { icon: Lightbulb, text: "Lighting not conducive to relaxation", severity: "moderate" },
      { icon: Layout, text: "Storage space may be insufficient", severity: "moderate" },
      { icon: Paintbrush, text: "Wall colors or textures feel dated", severity: "minor" },
      { icon: Thermometer, text: "Climate and noise control could improve sleep", severity: "minor" },
      { icon: Calendar, text: "Flooring or carpet showing age", severity: "minor" },
    ],
    improvements: [
      { icon: Lightbulb, text: "Add bedside sconces and dimmable ambient lighting" },
      { icon: Layout, text: "Install built-in wardrobes with seamless plaster-finish doors" },
      { icon: Paintbrush, text: "Apply venetian plaster or microcement accent headboard wall" },
      { icon: Thermometer, text: "Add blackout shades and sound insulation" },
      { icon: Wrench, text: "Install continuous microcement flooring for seamless look" },
    ],
  },
  "Home Office": {
    conditions: [
      { icon: Lightbulb, text: "Task lighting insufficient for screen work", severity: "moderate" },
      { icon: Layout, text: "Desk placement not optimizing natural light", severity: "minor" },
      { icon: Zap, text: "Power outlets and cable management lacking", severity: "moderate" },
      { icon: Calendar, text: "Storage solutions inadequate for organization", severity: "moderate" },
      { icon: Thermometer, text: "Acoustics may cause echo or distraction", severity: "minor" },
    ],
    improvements: [
      { icon: Lightbulb, text: "Add adjustable task lighting and reduce glare" },
      { icon: Layout, text: "Position desk for optimal natural light" },
      { icon: Zap, text: "Install cable management and power solutions" },
      { icon: Wrench, text: "Add built-in shelving and filing storage" },
      { icon: Paintbrush, text: "Use acoustic panels for sound control" },
    ],
  },
  Garage: {
    conditions: [
      { icon: Paintbrush, text: "Concrete floor showing cracks or stains", severity: "significant" },
      { icon: Layout, text: "Storage is disorganized or insufficient", severity: "moderate" },
      { icon: Lightbulb, text: "Lighting inadequate for workspace", severity: "moderate" },
      { icon: Thermometer, text: "No climate control for extreme temperatures", severity: "minor" },
      { icon: Calendar, text: "Walls and ceiling unfinished", severity: "minor" },
    ],
    improvements: [
      { icon: Paintbrush, text: "Apply seamless epoxy or microcement floor coating" },
      { icon: Layout, text: "Install wall-mounted organization systems" },
      { icon: Lightbulb, text: "Upgrade to bright LED shop lighting" },
      { icon: Wrench, text: "Add workbench with seamless microcement backsplash" },
      { icon: Zap, text: "Finish walls with smooth microcement for clean look" },
    ],
  },
  Patio: {
    conditions: [
      { icon: Paintbrush, text: "Surface material showing weathering", severity: "moderate" },
      { icon: Droplets, text: "Drainage may need improvement", severity: "moderate" },
      { icon: Lightbulb, text: "Outdoor lighting insufficient for evening use", severity: "minor" },
      { icon: Layout, text: "Space not defined for activities", severity: "minor" },
      { icon: Thermometer, text: "No shade or weather protection", severity: "moderate" },
    ],
    improvements: [
      { icon: Paintbrush, text: "Install seamless microterrazzo or microcement flooring" },
      { icon: Wrench, text: "Add pergola or shade structure" },
      { icon: Lightbulb, text: "Install string lights and landscape lighting" },
      { icon: Layout, text: "Create zones for dining and lounging" },
      { icon: Zap, text: "Add rockscape accent wall as outdoor focal point" },
    ],
  },
  "Pool Deck": {
    conditions: [
      { icon: Paintbrush, text: "Deck surface showing wear or fading", severity: "moderate" },
      { icon: Droplets, text: "Drainage may pool water in areas", severity: "significant" },
      { icon: Thermometer, text: "Surface gets too hot in direct sun", severity: "moderate" },
      { icon: Layout, text: "Seating and shade areas limited", severity: "minor" },
      { icon: Lightbulb, text: "Pool and deck lighting outdated", severity: "minor" },
    ],
    improvements: [
      { icon: Paintbrush, text: "Apply seamless microterrazzo — cool-touch, non-slip surface" },
      { icon: Wrench, text: "Coat wet zones with waterproof micro quartz" },
      { icon: Layout, text: "Add cabana or pergola for shade" },
      { icon: Lightbulb, text: "Upgrade pool lighting to color LED" },
      { icon: Zap, text: "Build rockscape water feature or accent wall" },
    ],
  },
  Backyard: {
    conditions: [
      { icon: Paintbrush, text: "Landscaping overgrown or sparse", severity: "moderate" },
      { icon: Layout, text: "No defined outdoor living areas", severity: "moderate" },
      { icon: Lightbulb, text: "Pathway and accent lighting absent", severity: "minor" },
      { icon: Droplets, text: "Irrigation may be inefficient", severity: "minor" },
      { icon: Calendar, text: "Hardscape elements showing age", severity: "moderate" },
    ],
    improvements: [
      { icon: Paintbrush, text: "Install seamless microterrazzo pathways and patio" },
      { icon: Layout, text: "Create seamless patio, fire pit, and lawn zones" },
      { icon: Lightbulb, text: "Add pathway and landscape lighting" },
      { icon: Droplets, text: "Install smart irrigation system" },
      { icon: Wrench, text: "Build rockscape fire pit surround or accent wall" },
    ],
  },
  "Feature Wall": {
    conditions: [
      { icon: Paintbrush, text: "Current wall surface is flat and unremarkable", severity: "moderate" },
      { icon: Lightbulb, text: "No accent lighting to highlight a focal wall", severity: "moderate" },
      { icon: Layout, text: "Room lacks a clear visual anchor point", severity: "minor" },
      { icon: Calendar, text: "Wall finish may be outdated or generic", severity: "minor" },
      { icon: Zap, text: "Existing outlets or vents may need rerouting", severity: "minor" },
    ],
    improvements: [
      { icon: Paintbrush, text: "Install a custom rockscape feature wall with microaggregate finish" },
      { icon: Lightbulb, text: "Add integrated LED backlighting for dramatic effect" },
      { icon: Wrench, text: "Finish surrounding walls in smooth microcement or venetian plaster" },
      { icon: Layout, text: "Rearrange furniture to showcase the feature wall" },
      { icon: Shield, text: "Seal all surfaces for long-term durability" },
    ],
  },
};

// Cost ranges by room type and budget tier
const COST_RANGES = {
  Bathroom: {
    under_5k: { basic: [1500, 3000], mid: [3000, 4500], full: [4000, 5000] },
    "5k_10k": { basic: [3000, 5000], mid: [5000, 8000], full: [8000, 10000] },
    "10k_20k": { basic: [5000, 8000], mid: [10000, 15000], full: [15000, 20000] },
    "20k_plus": { basic: [8000, 12000], mid: [15000, 25000], full: [25000, 45000] },
  },
  Kitchen: {
    under_5k: { basic: [2000, 3500], mid: [3500, 4500], full: [4500, 5000] },
    "5k_10k": { basic: [4000, 6000], mid: [6000, 8500], full: [8500, 10000] },
    "10k_20k": { basic: [8000, 12000], mid: [12000, 17000], full: [17000, 20000] },
    "20k_plus": { basic: [12000, 20000], mid: [25000, 40000], full: [40000, 75000] },
  },
  "Living Room": {
    under_5k: { basic: [1000, 2000], mid: [2000, 3500], full: [3500, 5000] },
    "5k_10k": { basic: [2500, 4500], mid: [4500, 7500], full: [7500, 10000] },
    "10k_20k": { basic: [5000, 8000], mid: [8000, 14000], full: [14000, 20000] },
    "20k_plus": { basic: [8000, 15000], mid: [15000, 30000], full: [30000, 50000] },
  },
  Garage: {
    under_5k: { basic: [1500, 2500], mid: [2500, 4000], full: [4000, 5000] },
    "5k_10k": { basic: [3000, 5000], mid: [5000, 7500], full: [7500, 10000] },
    "10k_20k": { basic: [5000, 8000], mid: [8000, 14000], full: [14000, 20000] },
    "20k_plus": { basic: [8000, 15000], mid: [15000, 25000], full: [25000, 40000] },
  },
  Patio: {
    under_5k: { basic: [1500, 2500], mid: [2500, 4000], full: [4000, 5000] },
    "5k_10k": { basic: [3000, 5000], mid: [5000, 8000], full: [8000, 10000] },
    "10k_20k": { basic: [6000, 10000], mid: [10000, 15000], full: [15000, 20000] },
    "20k_plus": { basic: [10000, 18000], mid: [18000, 35000], full: [35000, 60000] },
  },
  default: {
    under_5k: { basic: [1500, 2500], mid: [2500, 4000], full: [4000, 5000] },
    "5k_10k": { basic: [3000, 5000], mid: [5000, 8000], full: [8000, 10000] },
    "10k_20k": { basic: [5000, 10000], mid: [10000, 15000], full: [15000, 20000] },
    "20k_plus": { basic: [10000, 15000], mid: [15000, 30000], full: [30000, 50000] },
  },
  "Feature Wall": {
    under_5k: { basic: [2000, 3000], mid: [3000, 4500], full: [4500, 5000] },
    "5k_10k": { basic: [3500, 5000], mid: [5000, 7500], full: [7500, 10000] },
    "10k_20k": { basic: [5000, 8000], mid: [8000, 14000], full: [14000, 20000] },
    "20k_plus": { basic: [8000, 15000], mid: [15000, 25000], full: [25000, 40000] },
  },
};

const severityStyles = {
  significant: "text-red-600 bg-red-50",
  moderate: "text-amber-600 bg-amber-50",
  minor: "text-green-600 bg-green-50",
};

const formatCurrency = (num) => `$${num.toLocaleString()}`;

export default function AnalysisPage() {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const projectType = location.state?.projectType || "Bathroom";
  const budget = location.state?.budget || "10k_20k";
  const zipCode = location.state?.zipCode || "";

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Get analysis data for this room type
  const analysisData = ROOM_ANALYSIS_DATA[projectType] || ROOM_ANALYSIS_DATA.Bathroom;
  const costData = COST_RANGES[projectType]?.[budget] || COST_RANGES.default[budget] || COST_RANGES.default["10k_20k"];

  // Simulate analysis progress (runs once on mount — state setters are stable)
  useEffect(() => {
    const timers = [
      { delay: 800, step: 1 },
      { delay: 1500, step: 2 },
      { delay: 2200, step: 3 },
      { delay: 2800, step: 4 },
      { delay: 3500, step: 5 },
    ];

    const ids = timers.map(({ delay, step }) =>
      setTimeout(() => {
        setCurrentStep(step);
        if (step === 5) {
          setIsAnalyzing(false);
          setAnalysisComplete(true);
        }
      }, delay)
    );

    return () => ids.forEach(clearTimeout);
  }, [setCurrentStep, setIsAnalyzing, setAnalysisComplete]);

  const handleContinue = () => {
    navigate(`/results/${projectId}`, {
      state: { projectType, budget, zipCode }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-white">
      <Navbar />
      
      <main className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-[#D97757] uppercase tracking-widest mb-2">
            The Seamless Studio — Step 2 of 3
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
            Scanning Your Space
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We're analyzing your {projectType.toLowerCase()} to identify what needs work — and what seamless surfaces will look best.
          </p>
        </div>

        {/* Analysis Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-border/40 overflow-hidden" data-testid="analysis-card">
          
          {/* Card Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'Fraunces', serif" }}>
                  Room Assessment
                </h2>
                <p className="text-sm text-white/80">{projectType} Renovation Analysis</p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isAnalyzing && (
            <div className="p-8" data-testid="analysis-loading">
              <div className="flex flex-col items-center gap-4 mb-8">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">
                  {currentStep === 1 && "Reading your room..."}
                  {currentStep === 2 && "Spotting what needs attention..."}
                  {currentStep === 3 && "Picking the best surfaces for your space..."}
                  {currentStep === 4 && "Crunching the numbers..."}
                </p>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`h-20 rounded-xl transition-all duration-500 ${
                    currentStep >= i ? "bg-primary/10" : "bg-muted/50"
                  }`} />
                ))}
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysisComplete && (
            <div className="p-6 space-y-8" data-testid="analysis-results">
              
              {/* Section 1: Detected Conditions */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-lg text-foreground">Detected Conditions</h3>
                </div>
                <div className="space-y-3">
                  {analysisData.conditions.map((condition, idx) => {
                    const Icon = condition.icon;
                    return (
                      <div 
                        key={condition.text}
                        className={`flex items-start gap-3 p-3 rounded-xl ${severityStyles[condition.severity]}`}
                        data-testid={`condition-${idx}`}
                      >
                        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium">{condition.text}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Section 2: Recommended Improvements */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Wrench className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg text-foreground">Recommended Improvements</h3>
                </div>
                <div className="space-y-3">
                  {analysisData.improvements.map((improvement, idx) => {
                    const Icon = improvement.icon;
                    return (
                      <div 
                        key={improvement.text}
                        className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10"
                        data-testid={`improvement-${idx}`}
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-sm text-foreground">{improvement.text}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Section 3: Estimated Project Range */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-lg text-foreground">Estimated Project Range</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Basic Refresh */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center" data-testid="cost-basic">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
                      Basic Refresh
                    </p>
                    <p className="text-2xl font-bold text-green-800 mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                      {formatCurrency(costData.basic[0])} – {formatCurrency(costData.basic[1])}
                    </p>
                    <p className="text-xs text-green-600">Surface updates & repairs</p>
                  </div>

                  {/* Mid-Range */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center" data-testid="cost-mid">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                      Mid-Range Renovation
                    </p>
                    <p className="text-2xl font-bold text-amber-800 mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                      {formatCurrency(costData.mid[0])} – {formatCurrency(costData.mid[1])}
                    </p>
                    <p className="text-xs text-amber-600">Quality materials & new fixtures</p>
                  </div>

                  {/* Full Upgrade */}
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 text-center" data-testid="cost-full">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                      Full Upgrade
                    </p>
                    <p className="text-2xl font-bold text-primary mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                      {formatCurrency(costData.full[0])} – {formatCurrency(costData.full[1])}
                    </p>
                    <p className="text-xs text-primary/70">Premium finishes & complete redesign</p>
                  </div>
                </div>
              </section>

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border/40">
                Estimates based on typical {projectType.toLowerCase()} renovations. Final costs vary by scope, materials, and location.
              </p>
            </div>
          )}
        </div>

        {/* Continue Button */}
        {analysisComplete && (
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleContinue}
              size="lg"
              className="rounded-full px-8 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
              data-testid="continue-to-designs-btn"
            >
              <span>Show Me the Designs</span>
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Generation Notice */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          {isAnalyzing ? "AI is generating your renovation designs in the background..." : (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Your custom designs are ready to view
            </span>
          )}
        </p>
      </main>
    </div>
  );
}
