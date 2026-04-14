import { useState } from "react";
import { 
  AlertTriangle, CheckCircle, Wrench, DollarSign, 
  ChevronDown, ChevronUp, Droplets, Lightbulb, Layout, 
  Calendar, Shield, TrendingUp
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const severityColors = {
  significant: "bg-red-100 text-red-700 border-red-200",
  moderate: "bg-amber-100 text-amber-700 border-amber-200",
  minor: "bg-green-100 text-green-700 border-green-200",
};

const severityIcons = {
  significant: <AlertTriangle className="w-4 h-4" />,
  moderate: <AlertTriangle className="w-4 h-4" />,
  minor: <CheckCircle className="w-4 h-4" />,
};

const priorityColors = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-green-500",
};

const categoryIcons = {
  "Surface Wear": <Wrench className="w-4 h-4" />,
  "Moisture": <Droplets className="w-4 h-4" />,
  "Outdated Materials": <Calendar className="w-4 h-4" />,
  "Layout": <Layout className="w-4 h-4" />,
  "Lighting": <Lightbulb className="w-4 h-4" />,
  "Safety": <Shield className="w-4 h-4" />,
  default: <AlertTriangle className="w-4 h-4" />,
};

const formatCurrency = (num) => {
  if (!num) return "$0";
  return `$${num.toLocaleString()}`;
};

const RoomAnalysis = ({ analysis, projectType, isLoading }) => {
  const [expanded, setExpanded] = useState(true);
  const [showAllConditions, setShowAllConditions] = useState(false);
  const [showAllFixes, setShowAllFixes] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-border/40 p-6 mb-8" data-testid="room-analysis-loading">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
              Analyzing Your {projectType}...
            </h3>
            <p className="text-sm text-muted-foreground">Our AI is inspecting the photo for renovation needs</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const conditions = analysis.detected_conditions || [];
  const fixes = analysis.recommended_fixes || [];
  const costImpact = analysis.cost_impact || {};
  const overallAssessment = analysis.overall_assessment || "";

  const visibleConditions = showAllConditions ? conditions : conditions.slice(0, 3);
  const visibleFixes = showAllFixes ? fixes : fixes.slice(0, 3);

  return (
    <div 
      className="bg-white rounded-2xl border border-border/40 overflow-hidden mb-8 shadow-sm"
      data-testid="room-analysis"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
              Professional Assessment
            </h3>
            <p className="text-sm text-muted-foreground">
              {conditions.length} conditions detected • {fixes.length} recommendations
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="p-6 space-y-6">
          {/* Overall Assessment */}
          {overallAssessment && (
            <div className="bg-muted/30 rounded-xl p-4 border-l-4 border-primary">
              <p className="text-sm text-foreground leading-relaxed italic">
                "{overallAssessment}"
              </p>
              <p className="text-xs text-muted-foreground mt-2 font-medium">— AI Contractor Assessment</p>
            </div>
          )}

          {/* Detected Conditions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h4 className="font-semibold text-foreground">Detected Conditions</h4>
            </div>
            <div className="space-y-2">
              {visibleConditions.map((condition, idx) => (
                <div
                  key={condition.category + condition.description}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${severityColors[condition.severity] || severityColors.moderate}`}
                  data-testid={`condition-${idx}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {categoryIcons[condition.category] || categoryIcons.default}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{condition.category}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {condition.severity}
                      </Badge>
                    </div>
                    <p className="text-sm opacity-90">{condition.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {conditions.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllConditions(!showAllConditions)}
                className="mt-2 text-xs"
              >
                {showAllConditions ? "Show Less" : `Show ${conditions.length - 3} More`}
              </Button>
            )}
          </div>

          {/* Recommended Fixes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-foreground">Recommended Fixes</h4>
            </div>
            <div className="space-y-2">
              {visibleFixes.map((fix, idx) => (
                <div
                  key={fix.fix + fix.priority}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/40"
                  data-testid={`fix-${idx}`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${priorityColors[fix.priority] || priorityColors.medium}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">{fix.fix}</span>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {fix.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{fix.reason}</p>
                  </div>
                </div>
              ))}
            </div>
            {fixes.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllFixes(!showAllFixes)}
                className="mt-2 text-xs"
              >
                {showAllFixes ? "Show Less" : `Show ${fixes.length - 3} More`}
              </Button>
            )}
          </div>

          {/* Cost Impact Ranges */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-green-600" />
              <h4 className="font-semibold text-foreground">Estimated Cost Ranges</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Basic Repair */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4" data-testid="cost-basic">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Basic Repair</span>
                </div>
                <p className="text-xl font-bold text-green-800" style={{ fontFamily: "'Fraunces', serif" }}>
                  {formatCurrency(costImpact.basic_repair?.low)} - {formatCurrency(costImpact.basic_repair?.high)}
                </p>
                <p className="text-xs text-green-700 mt-1">{costImpact.basic_repair?.description}</p>
              </div>

              {/* Mid-Level */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4" data-testid="cost-mid">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Mid-Level Renovation</span>
                </div>
                <p className="text-xl font-bold text-amber-800" style={{ fontFamily: "'Fraunces', serif" }}>
                  {formatCurrency(costImpact.mid_level_renovation?.low)} - {formatCurrency(costImpact.mid_level_renovation?.high)}
                </p>
                <p className="text-xs text-amber-700 mt-1">{costImpact.mid_level_renovation?.description}</p>
              </div>

              {/* Full Upgrade */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4" data-testid="cost-full">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Full Upgrade</span>
                </div>
                <p className="text-xl font-bold text-primary" style={{ fontFamily: "'Fraunces', serif" }}>
                  {formatCurrency(costImpact.full_upgrade?.low)} - {formatCurrency(costImpact.full_upgrade?.high)}
                </p>
                <p className="text-xs text-primary/80 mt-1">{costImpact.full_upgrade?.description}</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/40">
            This AI-powered assessment is for planning purposes. A professional on-site inspection is recommended for accurate quotes.
          </p>
        </div>
      )}
    </div>
  );
};

export default RoomAnalysis;
