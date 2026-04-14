import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "../components/ui/button";
import { Star, Phone, MapPin } from "lucide-react";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const customIcon = new L.DivIcon({
  className: "",
  html: '<div class="custom-pin"></div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 11);
  }, [center, map]);
  return null;
};

export const ContractorMap = ({ contractors = [], userLocation, onRequestQuote }) => {
  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [39.8283, -98.5795];

  return (
    <div className="rounded-2xl overflow-hidden border border-border/40 shadow-sm" data-testid="contractor-map">
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: "400px", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} />
        {contractors.map((c) => (
          <Marker
            key={c.id}
            position={[c.latitude || center[0], c.longitude || center[1]]}
            icon={customIcon}
          >
            <Popup>
              <div className="p-3 min-w-[220px]">
                <h3 className="font-semibold text-sm text-[#1A3C34] mb-1">{c.company_name}</h3>
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={`map-star-${c.id}-${i}`}
                      className={`w-3 h-3 ${i < Math.round(c.rating || 0) ? "fill-[#D97757] text-[#D97757]" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">({c.review_count || 0})</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <MapPin className="w-3 h-3" />
                  <span>{c.distance_miles ? `${c.distance_miles} mi away` : "Nearby"}</span>
                </div>
                {c.phone && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <Phone className="w-3 h-3" />
                    <span>{c.phone}</span>
                  </div>
                )}
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{c.description}</p>
                <button
                  onClick={() => onRequestQuote && onRequestQuote(c)}
                  className="w-full bg-[#1A3C34] text-white text-xs py-1.5 px-3 rounded-full hover:bg-[#142F29] transition-colors"
                  data-testid={`request-quote-map-${c.id}`}
                >
                  Request Quote
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
