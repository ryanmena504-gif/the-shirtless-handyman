import { useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { Upload, X, Trash2, Image as ImageIcon } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminPortfolioTab = ({ portfolio, onRefresh }) => {
  const [uploading, setUploading] = useState(false);
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [beforePreview, setBeforePreview] = useState(null);
  const [afterPreview, setAfterPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [roomType, setRoomType] = useState("");

  const handleFileSelect = (setter, previewSetter) => (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setter(f);
      const reader = new FileReader();
      reader.onloadend = () => previewSetter(reader.result);
      reader.readAsDataURL(f);
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      const t = localStorage.getItem("admin_token");
      const fd = new FormData();
      fd.append("before_photo", beforeFile);
      fd.append("after_photo", afterFile);
      fd.append("title", title || "Renovation Project");
      fd.append("description", desc);
      fd.append("room_type", roomType);
      await axios.post(`${API}/admin/portfolio`, fd, {
        headers: { Authorization: `Bearer ${t}`, "Content-Type": "multipart/form-data" },
      });
      toast.success("Portfolio item uploaded!");
      setBeforeFile(null); setAfterFile(null);
      setBeforePreview(null); setAfterPreview(null);
      setTitle(""); setDesc(""); setRoomType("");
      onRefresh();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (itemId) => {
    const t = localStorage.getItem("admin_token");
    try {
      await axios.delete(`${API}/admin/portfolio/${itemId}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      toast.success("Portfolio item deleted");
      onRefresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-8" data-testid="admin-portfolio-section">
      {/* Upload Form */}
      <div className="bg-white border border-border/40 rounded-2xl p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#D97757]" />
          Upload Before & After Photos
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PhotoUploadSlot
              label="Before Photo"
              preview={beforePreview}
              onRemove={() => { setBeforeFile(null); setBeforePreview(null); }}
              onChange={handleFileSelect(setBeforeFile, setBeforePreview)}
              badgeText="Before"
              badgeClass="bg-black/50"
              testId="admin-before"
            />
            <PhotoUploadSlot
              label="After Photo"
              preview={afterPreview}
              onRemove={() => { setAfterFile(null); setAfterPreview(null); }}
              onChange={handleFileSelect(setAfterFile, setAfterPreview)}
              badgeText="After"
              badgeClass="bg-[#D97757]"
              testId="admin-after"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input
                data-testid="admin-portfolio-title"
                placeholder="e.g. Master Bathroom Remodel"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Room Type</Label>
              <Input
                data-testid="admin-portfolio-room-type"
                placeholder="e.g. Bathroom"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="h-10 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Input
                data-testid="admin-portfolio-desc"
                placeholder="Brief description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="h-10 rounded-lg"
              />
            </div>
          </div>
          <Button
            disabled={!beforeFile || !afterFile || uploading}
            onClick={handleUpload}
            className="rounded-full bg-primary text-primary-foreground btn-pill"
            data-testid="admin-portfolio-upload-btn"
          >
            {uploading ? "Uploading..." : "Upload Portfolio Item"}
          </Button>
        </div>
      </div>

      {/* Portfolio Items List */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Uploaded Portfolio ({portfolio.length})</h3>
        {portfolio.length === 0 ? (
          <div className="bg-white border border-border/40 rounded-2xl p-12 text-center">
            <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No portfolio items yet. Upload your first before & after photos above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolio.map((item) => (
              <div key={item.id} className="bg-white border border-border/40 rounded-2xl overflow-hidden" data-testid={`admin-portfolio-item-${item.id}`}>
                <div className="grid grid-cols-2">
                  <div className="relative">
                    <img src={item.before_image} alt="Before" className="w-full h-32 object-cover" />
                    <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">Before</div>
                  </div>
                  <div className="relative">
                    <img src={item.after_image} alt="After" className="w-full h-32 object-cover" />
                    <div className="absolute bottom-1 left-1 bg-[#D97757] text-white text-[10px] px-1.5 py-0.5 rounded">After</div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    {item.room_type && <Badge className="text-xs bg-accent text-accent-foreground mt-1">{item.room_type}</Badge>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                    onClick={() => handleDelete(item.id)}
                    data-testid={`admin-portfolio-delete-${item.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PhotoUploadSlot = ({ label, preview, onRemove, onChange, badgeText, badgeClass, testId }) => (
  <div>
    <Label className="text-sm font-medium mb-2 block">{label}</Label>
    {preview ? (
      <div className="relative rounded-xl overflow-hidden border border-border/40">
        <img src={preview} alt={badgeText} className="w-full h-40 object-cover" />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
          data-testid={`${testId}-remove`}
        >
          <X className="w-3 h-3" />
        </button>
        <div className={`absolute bottom-2 left-2 ${badgeClass} text-white text-[10px] px-2 py-0.5 rounded-full`}>{badgeText}</div>
      </div>
    ) : (
      <label className="flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors" data-testid={`${testId}-upload`}>
        <ImageIcon className="w-6 h-6 text-muted-foreground mb-1" />
        <span className="text-xs text-muted-foreground">Click to upload</span>
        <input type="file" accept="image/*" className="hidden" onChange={onChange} />
      </label>
    )}
  </div>
);
