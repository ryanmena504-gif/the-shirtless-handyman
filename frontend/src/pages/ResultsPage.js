import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../components/Navbar";
import { ContractorMap } from "../components/ContractorMap";
import { LeadCaptureModal } from "../components/LeadCaptureModal";
import { BeforeAfterSlider } from "../components/BeforeAfterSlider";
import MaterialsListPDF from "../components/MaterialsListPDF";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import {
  Sparkles, DollarSign, Wrench, Package, TrendingUp,
  Star, MapPin, Phone, CheckCircle, AlertCircle, ArrowLeftRight, Share2, FileDown
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const formatCurrency = (n) => `$${n.toLocaleString()}`;

export default function ResultsPage() {
  const { projectId } = useParams();
  const location = useLocation();
  const zipCode = location.state?.zipCode || "";

  const [project, setProject] = useState(null);
  const [generating, setGenerating] = useState(true);
  const [error, setError] = useState(null);
  const [contractors, setContractors] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfDesignName, setPdfDesignName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    generateDesigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const generateDesigns = async () => {
    setGenerating(true);
    setError(null);
    try {
      // First check if project already has results
      const checkRes = await axios.get(`${API}/projects/${projectId}`, { timeout: 10000 });
      if (checkRes.data.status === "completed" && checkRes.data.designs?.length > 0) {
        setProject(checkRes.data);
        setSelectedDesign(0);
        setGenerating(false);
        // Fetch contractors with project type for routing
        const zip = zipCode || checkRes.data.zip_code || "10001";
        const projectType = checkRes.data.project_type || "";
        const cRes = await axios.get(`${API}/contractors/search?zip_code=${zip}&project_type=${encodeURIComponent(projectType)}`);
        setContractors(cRes.data.contractors || []);
        setUserLocation(cRes.data.user_location);
        return;
      }

      // Trigger generation (returns immediately)
      await axios.post(`${API}/projects/${projectId}/generate`, {}, { timeout: 15000 });

      // Poll for completion
      const pollInterval = 3000;
      const maxAttempts = 60; // 3 minutes max
      let attempts = 0;

      const poll = async () => {
        attempts++;
        try {
          const res = await axios.get(`${API}/projects/${projectId}`, { timeout: 10000 });
          const data = res.data;

          if (data.status === "completed" && data.designs?.length > 0) {
            setProject(data);
            setSelectedDesign(0);
            setGenerating(false);

            // Fetch contractors with project type for routing
            const zip = zipCode || data.zip_code || "10001";
            const projectType = data.project_type || "";
            const cRes = await axios.get(`${API}/contractors/search?zip_code=${zip}&project_type=${encodeURIComponent(projectType)}`);
            setContractors(cRes.data.contractors || []);
            setUserLocation(cRes.data.user_location);
            return;
          }

          if (data.status === "failed") {
            const errMsg = data.error || "Design generation failed.";
            if (errMsg.includes("budget")) {
              setError("AI generation budget exceeded. Please add balance at Profile > Universal Key > Add Balance.");
            } else {
              setError("Design generation failed. Please try again.");
            }
            setGenerating(false);
            return;
          }

          // Still generating
          if (attempts < maxAttempts) {
            setTimeout(poll, pollInterval);
          } else {
            setError("Generation is taking longer than expected. Please refresh the page.");
            setGenerating(false);
          }
        } catch {
          if (attempts < maxAttempts) {
            setTimeout(poll, pollInterval);
          } else {
            setError("Could not reach the server. Please try again.");
            setGenerating(false);
          }
        }
      };

      // Start polling after a brief delay
      setTimeout(poll, 2000);

    } catch (err) {
      const detail = err.response?.data?.detail || "";
      if (detail.includes("budget")) {
        setError("AI generation budget exceeded. Please add balance at Profile > Universal Key > Add Balance.");
      } else {
        setError("Failed to start design generation. Please try again.");
      }
      toast.error("Generation failed");
      setGenerating(false);
    }
  };

  const cost = project?.cost_estimate;

  const handleShare = async () => {
    setSharing(true);
    try {
      const formData = new FormData();
      formData.append("project_id", projectId);
      const res = await axios.post(`${API}/shares`, formData, { timeout: 10000 });
      navigate(`/share/${res.data.share_id}`);
    } catch {
      toast.error("Failed to create share link");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="results-page">
      <Navbar />

      <div className="pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-12">
            <p className="text-sm uppercase tracking-widest font-semibold text-[#D97757] mb-3">
              Step 2 of 3
            </p>
            <h1
              className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-4"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Your renovation designs
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our AI has generated personalized renovation options for your space.
            </p>
          </div>

          {/* Loading State */}
          {generating && (
            <div className="flex flex-col items-center justify-center py-24 gap-6" data-testid="generating-loader">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-medium text-foreground mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                  Generating your designs...
                </h3>
                <p className="text-sm text-muted-foreground">
                  Our AI is creating 3 unique renovation styles. This may take a minute.
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !generating && (
            <div className="flex flex-col items-center justify-center py-24 gap-6" data-testid="error-state">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-muted-foreground">{error}</p>
              <Button
                onClick={generateDesigns}
                className="rounded-full bg-primary text-primary-foreground btn-pill"
                data-testid="retry-btn"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Designs with Before/After Sliders */}
          {!generating && project?.designs?.length > 0 && (
            <>
              <div className="space-y-10 mb-16" data-testid="designs-grid">
                {project.designs.map((design, i) => (
                  <div key={i} data-testid={`design-block-${i}`}>
                    {/* Design header row */}
                    <button
                      onClick={() => setSelectedDesign(i)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl mb-4 transition-all duration-300 text-left ${
                        selectedDesign === i
                          ? "bg-[#D97757]/10 border-2 border-[#D97757]"
                          : "bg-white border-2 border-border/40 hover:border-primary/30"
                      }`}
                      data-testid={`design-card-${i}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-[#D97757] tracking-wide uppercase w-14">Style {i + 1}</span>
                        <h3 className="text-lg font-medium text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>{design.name}</h3>
                      </div>
                      {selectedDesign === i && (
                        <CheckCircle className="w-5 h-5 text-[#D97757] flex-shrink-0" />
                      )}
                    </button>

                    {/* Before / After slider for this design */}
                    {project.original_image && (
                      <BeforeAfterSlider
                        beforeImage={project.original_image}
                        afterImage={design.image}
                        beforeLabel="Original"
                        afterLabel={design.name}
                        designName={design.name}
                        contractors={contractors}
                        onRequestQuote={(contractor) => {
                          setSelectedContractor(contractor);
                          setQuoteModalOpen(true);
                        }}
                        onSaveMaterialsList={() => {
                          setPdfDesignName(design.name);
                          setPdfModalOpen(true);
                        }}
                      />
                    )}

                    {/* Save Materials List Button (below design) */}
                    <div className="flex justify-center mt-4">
                      <Button
                        onClick={() => {
                          setPdfDesignName(design.name);
                          setPdfModalOpen(true);
                        }}
                        variant="outline"
                        className="rounded-full border-primary/40 text-primary hover:bg-primary/5"
                        data-testid={`save-materials-btn-${i}`}
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        Save Materials List
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Share Button */}
              <div className="flex justify-center mb-16" data-testid="share-section">
                <Button
                  onClick={handleShare}
                  disabled={sharing}
                  className="rounded-full h-12 px-8 bg-[#D97757] text-white hover:bg-[#C56545] btn-pill shadow-lg shadow-[#D97757]/20 text-sm font-medium"
                  data-testid="share-renovation-btn"
                >
                  {sharing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating share link...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Share My Renovation Ideas
                    </span>
                  )}
                </Button>
              </div>

              {/* Cost Estimate */}
              {cost && (
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
              )}

              {/* Contractors Section */}
              <div className="mb-16" data-testid="contractors-section">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="w-5 h-5 text-[#D97757]" />
                  <h2
                    className="text-2xl md:text-3xl font-medium text-foreground"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    Local Contractors Near You
                  </h2>
                </div>

                <ContractorMap
                  contractors={contractors}
                  userLocation={userLocation}
                  onRequestQuote={(c) => {
                    setSelectedContractor(c);
                    setQuoteModalOpen(true);
                  }}
                />

                {/* Contractor Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {contractors.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white border border-border/40 rounded-2xl p-6 hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-shadow duration-300"
                      data-testid={`contractor-card-${c.id}`}
                    >
                      <h3 className="font-semibold text-foreground mb-1">{c.company_name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.round(c.rating || 0) ? "fill-[#D97757] text-[#D97757]" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                          {c.rating} ({c.review_count} reviews)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {c.specialties?.map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs bg-accent text-accent-foreground">
                            {s}
                          </Badge>
                        ))}
                      </div>
                      {c.distance_miles > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3" />
                          {c.distance_miles} miles away
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <Phone className="w-3 h-3" />
                          {c.phone}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{c.description}</p>
                      <Button
                        onClick={() => {
                          setSelectedContractor(c);
                          setQuoteModalOpen(true);
                        }}
                        className="w-full rounded-full bg-primary text-primary-foreground h-10 text-sm btn-pill"
                        data-testid={`request-quote-btn-${c.id}`}
                      >
                        Request Quote
                      </Button>
                    </div>
                  ))}
                </div>

                {contractors.length === 0 && !generating && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No contractors found in your area yet.</p>
                    <Button
                      onClick={() => {
                        setSelectedContractor(null);
                        setQuoteModalOpen(true);
                      }}
                      className="mt-4 rounded-full bg-primary text-primary-foreground btn-pill"
                      data-testid="general-quote-btn"
                    >
                      Request General Quote
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* No designs generated */}
          {!generating && !error && project?.designs?.length === 0 && (
            <div className="text-center py-24" data-testid="no-designs">
              <p className="text-muted-foreground mb-4">No designs were generated. Please try again.</p>
              <Button
                onClick={generateDesigns}
                className="rounded-full bg-primary text-primary-foreground btn-pill"
                data-testid="retry-no-designs-btn"
              >
                Retry Generation
              </Button>
            </div>
          )}
        </div>
      </div>

      <LeadCaptureModal
        open={quoteModalOpen}
        onOpenChange={setQuoteModalOpen}
        contractor={selectedContractor}
        projectId={projectId}
        zipCode={zipCode || project?.zip_code || ""}
        selectedDesignStyle={selectedDesign !== null && project?.designs?.[selectedDesign] ? project.designs[selectedDesign].name : ""}
        roomPhoto={project?.original_image || ""}
      />

      <MaterialsListPDF
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        designName={pdfDesignName}
        projectType={project?.project_type || ""}
        zipCode={zipCode || project?.zip_code || ""}
        contractor={selectedContractor}
      />
    </div>
  );
}
