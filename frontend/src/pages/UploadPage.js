import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { 
  Upload, Camera, X, ArrowRight, MapPin, Star, Plus,
  Bath, UtensilsCrossed, Sofa, Bed, Baby, Briefcase,
  Car, WashingMachine, Warehouse, DoorOpen,
  TreePine, Waves, Flower2, Flame, Mountain
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ROOM_CATEGORIES = [
  {
    category: "Specialty",
    rooms: [
      { value: "Feature Wall", label: "Feature Wall / Rockscape", icon: Mountain, description: "Accent walls & rockscape", featured: true },
    ],
  },
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

  // Multi-image state: array of { file, preview }
  const [images, setImages] = useState([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [zipCode, setZipCode] = useState("");
  const [projectType, setProjectType] = useState(location.state?.projectType || "");
  const [budget, setBudget] = useState("");
  const [uploading, setUploading] = useState(false);

  const MAX_IMAGES = 3;

  const addFiles = (fileList) => {
    const newFiles = Array.from(fileList).filter(f => f.type.startsWith("image/"));
    const remaining = MAX_IMAGES - images.length;
    const toAdd = newFiles.slice(0, remaining);

    toAdd.forEach((f) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => {
          if (prev.length >= MAX_IMAGES) return prev;
          return [...prev, { file: f, preview: reader.result }];
        });
      };
      reader.readAsDataURL(f);
    });

    if (newFiles.length > remaining) {
      toast.info(`Maximum ${MAX_IMAGES} photos allowed`);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPrimaryIndex((prev) => {
      if (idx === prev) return 0;
      if (idx < prev) return prev - 1;
      return prev;
    });
  };

  const handleSubmit = async () => {
    if (images.length === 0) { toast.error("Please upload at least one photo"); return; }
    if (!zipCode) { toast.error("Please enter your ZIP code"); return; }
    if (!projectType) { toast.error("Please select a project type"); return; }
    if (!budget) { toast.error("Please select your budget range"); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", images[primaryIndex].file);
      formData.append("zip_code", zipCode);
      formData.append("project_type", projectType);
      formData.append("budget", budget);
      formData.append("primary_index", "0");

      // Add additional photos (everything except primary)
      images.forEach((img, i) => {
        if (i !== primaryIndex) {
          formData.append("additional_photos", img.file);
        }
      });

      const res = await axios.post(`${API}/projects/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Photos uploaded! Analyzing your room...");
      navigate(`/analysis/${res.data.id}`, {
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
              The Seamless Studio — Step 1 of 3
            </p>
            <h1
              className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-4"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Show us your room
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Snap a photo of any space — bathroom, kitchen, living room, patio, you name it. Upload up to 3 angles. Pick one as the main shot, and we'll handle the rest.
            </p>
          </div>

          {/* Upload Zone */}
          <div className="space-y-8">
            <div>
              <Label className="text-sm font-medium mb-3 block">Room Photos (up to 3)</Label>
              
              {/* Image thumbnails grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4" data-testid="image-previews">
                  {images.map((img, idx) => (
                    <div
                      key={img.file.name + idx}
                      className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 group ${
                        idx === primaryIndex
                          ? "border-[#D97757] shadow-lg shadow-[#D97757]/20 ring-2 ring-[#D97757]/30"
                          : "border-border/40 hover:border-primary/40"
                      }`}
                      onClick={() => setPrimaryIndex(idx)}
                      data-testid={`image-preview-${idx}`}
                    >
                      <img
                        src={img.preview}
                        alt={`Room angle ${idx + 1}`}
                        className="w-full h-[160px] object-cover"
                      />
                      {/* Primary badge */}
                      {idx === primaryIndex && (
                        <div className="absolute top-2 left-2 bg-[#D97757] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 fill-white" />
                          Primary
                        </div>
                      )}
                      {/* Remove button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                        data-testid={`remove-image-${idx}`}
                        aria-label="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {/* Click to set primary hint */}
                      {idx !== primaryIndex && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm text-white text-[10px] text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to set as primary
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add more slot */}
                  {images.length < MAX_IMAGES && (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 h-[160px] flex flex-col items-center justify-center gap-2 hover:bg-primary/10 transition-colors cursor-pointer"
                      data-testid="add-more-photos-btn"
                    >
                      <Plus className="w-6 h-6 text-primary/60" />
                      <span className="text-xs text-primary/60 font-medium">Add Photo</span>
                    </button>
                  )}
                </div>
              )}

              {/* Dropzone (only when no images yet) */}
              {images.length === 0 && (
                <div
                  className="blueprint-grid border-2 border-dashed border-primary/30 bg-primary/5 rounded-3xl p-12 text-center hover:bg-primary/10 transition-colors cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  data-testid="upload-dropzone"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Camera className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-foreground mb-1">
                        Drop your room photos here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse. 1–3 photos. JPG, PNG up to 10MB each.
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

              {/* Hidden file input - always allow multiple */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                data-testid="upload-file-input"
              />

              {images.length > 1 && (
                <p className="text-xs text-muted-foreground mt-2">
                  The <span className="text-[#D97757] font-semibold">primary</span> photo will be used for AI redesign. Additional photos provide context for better analysis.
                </p>
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
                  <div className={`grid gap-3 ${cat.rooms.length === 1 ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3"}`}>
                    {cat.rooms.map((room) => {
                      const Icon = room.icon;
                      const isSelected = projectType === room.value;
                      const isFeatured = room.featured;

                      const cardClass = (() => {
                        if (isSelected) return "border-[#D97757] bg-[#D97757]/10 shadow-md shadow-[#D97757]/10";
                        if (isFeatured) return "border-[#D97757]/40 bg-[#D97757]/5 hover:border-[#D97757] hover:bg-[#D97757]/10";
                        return "border-border/60 hover:border-primary/40 hover:bg-muted/50";
                      })();

                      const iconBgClass = (() => {
                        if (isSelected) return "bg-[#D97757] text-white";
                        if (isFeatured) return "bg-[#D97757]/15";
                        return "bg-muted group-hover:bg-primary/10";
                      })();

                      const iconClass = (() => {
                        if (isSelected) return "text-white";
                        if (isFeatured) return "text-[#D97757]";
                        return "text-muted-foreground group-hover:text-primary";
                      })();

                      const labelClass = (isSelected || isFeatured) ? "text-[#D97757]" : "text-foreground";

                      return (
                        <button
                          key={room.value}
                          type="button"
                          onClick={() => setProjectType(room.value)}
                          data-testid={`room-type-${room.value.toLowerCase().replace(/\s+/g, "-")}`}
                          className={`p-4 rounded-xl border-2 text-left transition-all duration-200 group ${cardClass}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${iconBgClass}`}>
                              <Icon className={`w-5 h-5 ${iconClass}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-semibold truncate ${labelClass}`}>
                                  {room.label}
                                </p>
                                {isFeatured && !isSelected && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#D97757] text-white flex-shrink-0">
                                    Signature
                                  </span>
                                )}
                              </div>
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
              disabled={uploading || images.length === 0 || !zipCode || !projectType || !budget}
              className="w-full h-14 rounded-full bg-primary text-primary-foreground text-base font-medium btn-pill shadow-lg shadow-primary/20 disabled:opacity-50"
              data-testid="upload-submit-btn"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading — hang tight...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  See My Room Transformed
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
