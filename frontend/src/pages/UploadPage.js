import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { 
  Upload, Camera, X, ArrowRight, MapPin,
  Bath, UtensilsCrossed, Sofa, Bed, Baby, Briefcase,
  Car, WashingMachine, Warehouse, DoorOpen,
  TreePine, Waves, Flower2, Flame
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Room categories with icons
const ROOM_CATEGORIES = [
  {
    category: "Interior Rooms",
    rooms: [
      { value: "Bathroom", label: "Bathroom", icon: Bath, description: "Tubs, showers, vanities" },
      { value: "Kitchen", label: "Kitchen", icon: UtensilsCrossed, description: "Cabinets, counters, appliances" },
      { value: "Living Room", label: "Living Room", icon: Sofa, description: "Main living spaces" },
      { value: "Bedroom", label: "Bedroom", icon: Bed, description: "Master & guest rooms" },
      { value: "Kids Room", label: "Kids Room / Nursery", icon: Baby, description: "Children's spaces" },
      { value: "Home Office", label: "Home Office", icon: Briefcase, description: "Work from home spaces" },
    ],
  },
  {
    category: "Functional Rooms",
    rooms: [
      { value: "Garage", label: "Garage", icon: Car, description: "Storage & workshop" },
      { value: "Laundry Room", label: "Laundry Room", icon: WashingMachine, description: "Utility spaces" },
      { value: "Basement", label: "Basement", icon: Warehouse, description: "Below-grade spaces" },
      { value: "Mudroom", label: "Mudroom", icon: DoorOpen, description: "Entry & storage" },
    ],
  },
  {
    category: "Outdoor Areas",
    rooms: [
      { value: "Patio", label: "Patio", icon: TreePine, description: "Covered outdoor living" },
      { value: "Pool Deck", label: "Pool Deck", icon: Waves, description: "Poolside areas" },
      { value: "Backyard", label: "Backyard", icon: Flower2, description: "Landscaping & gardens" },
      { value: "Outdoor Kitchen", label: "Outdoor Kitchen", icon: Flame, description: "Outdoor cooking spaces" },
    ],
  },
];

const BUDGET_OPTIONS = [
  { value: "under_5k", label: "Under $5,000", description: "Budget-friendly updates" },
  { value: "5k_10k", label: "$5,000 - $10,000", description: "Mid-range refresh" },
  { value: "10k_20k", label: "$10,000 - $20,000", description: "Substantial remodel" },
  { value: "20k_plus", label: "$20,000+", description: "Luxury transformation" },
];

export default function UploadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [zipCode, setZipCode] = useState("");
  const [projectType, setProjectType] = useState(location.state?.projectType || "");
  const [budget, setBudget] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) {
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    }
  };

  const handleSubmit = async () => {
    if (!file) { toast.error("Please upload a photo"); return; }
    if (!zipCode) { toast.error("Please enter your ZIP code"); return; }
    if (!projectType) { toast.error("Please select a project type"); return; }
    if (!budget) { toast.error("Please select your budget range"); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("zip_code", zipCode);
      formData.append("project_type", projectType);
      formData.append("budget", budget);

      const res = await axios.post(`${API}/projects/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Photo uploaded! Generating designs...");
      navigate(`/results/${res.data.id}`, {
        state: { projectType, zipCode, budget },
      });
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="upload-page">
      <Navbar />

      <div className="pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <p className="text-sm uppercase tracking-widest font-semibold text-[#D97757] mb-3">
              Step 1 of 3
            </p>
            <h1
              className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-4"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Upload your room
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Take a photo of the room you'd like to renovate, and our AI will generate stunning design options.
            </p>
          </div>

          {/* Upload Zone */}
          <div className="space-y-8">
            <div>
              <Label className="text-sm font-medium mb-3 block">Room Photo</Label>
              {preview ? (
                <div className="relative rounded-2xl overflow-hidden border border-border/40 animate-scale-in">
                  <img
                    src={preview}
                    alt="Room preview"
                    className="w-full h-[400px] object-cover"
                    data-testid="upload-preview-image"
                  />
                  <button
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    data-testid="upload-remove-btn"
                    aria-label="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="blueprint-grid border-2 border-dashed border-primary/30 bg-primary/5 rounded-3xl p-12 text-center hover:bg-primary/10 transition-colors cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  data-testid="upload-dropzone"
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    data-testid="upload-file-input"
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Camera className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-foreground mb-1">
                        Drag & drop your room photo here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse. JPG, PNG up to 10MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-full border-primary/20 text-primary"
                      data-testid="upload-browse-btn"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Browse Files
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Room Type Selection - Visual Cards */}
            <div className="space-y-6">
              <Label className="text-sm font-medium">Select Room Type</Label>
              {ROOM_CATEGORIES.map((cat) => (
                <div key={cat.category} className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                    {cat.category}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {cat.rooms.map((room) => {
                      const Icon = room.icon;
                      const isSelected = projectType === room.value;
                      return (
                        <button
                          key={room.value}
                          type="button"
                          onClick={() => setProjectType(room.value)}
                          data-testid={`room-type-${room.value.toLowerCase().replace(/\s+/g, "-")}`}
                          className={`p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border/60 hover:border-primary/40 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                              isSelected ? "bg-primary text-white" : "bg-muted group-hover:bg-primary/10"
                            }`}>
                              <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-muted-foreground group-hover:text-primary"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                                {room.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{room.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* ZIP Code */}
            <div className="space-y-2">
              <Label htmlFor="zip-code" className="text-sm font-medium">ZIP Code</Label>
              <div className="relative max-w-xs">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="zip-code"
                  data-testid="zip-code-input"
                  placeholder="10001"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="h-12 pl-10 rounded-lg border-border/60 focus:border-primary focus:ring-1 focus:ring-primary/20"
                  maxLength={5}
                />
              </div>
            </div>

            {/* Budget Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Budget Range</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBudget(opt.value)}
                    data-testid={`budget-${opt.value}`}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      budget === opt.value
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border/60 hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${budget === opt.value ? "text-primary" : "text-foreground"}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={uploading || !file || !zipCode || !projectType || !budget}
              className="w-full h-14 rounded-full bg-primary text-primary-foreground text-base font-medium btn-pill shadow-lg shadow-primary/20 disabled:opacity-50"
              data-testid="upload-submit-btn"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Generate AI Designs
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
