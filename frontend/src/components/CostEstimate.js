import { DollarSign, Wrench, Package, TrendingUp } from "lucide-react";

const formatCurrency = (n) => `$${n.toLocaleString()}`;

export const CostEstimate = ({ cost }) => {
  if (!cost) return null;

  return (
    <div className="mb-16" data-testid="cost-estimate-section">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="w-5 h-5 text-[#D97757]" />
        <h2
          className="text-2xl md:text-3xl font-medium text-foreground"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Estimated Renovation Cost
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-border/40 rounded-2xl p-6" data-testid="labor-cost-card">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Labor</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {formatCurrency(cost.labor_low)} — {formatCurrency(cost.labor_high)}
          </p>
        </div>
        <div className="bg-white border border-border/40 rounded-2xl p-6" data-testid="material-cost-card">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Materials</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {formatCurrency(cost.material_low)} — {formatCurrency(cost.material_high)}
          </p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6" data-testid="total-cost-card">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Total Estimate</span>
          </div>
          <p className="text-2xl font-semibold text-primary">
            {formatCurrency(cost.total_low)} — {formatCurrency(cost.total_high)}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        * Estimates based on {cost.project_type} projects in ZIP {cost.zip_code} (regional factor: {cost.regional_multiplier}x). Actual costs may vary.
      </p>
    </div>
  );
};
