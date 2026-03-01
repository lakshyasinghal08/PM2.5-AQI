import { MapPin } from "lucide-react";

interface MiniMapProps {
  city: string;
}

const cityCoords: Record<string, { lat: string; lng: string }> = {
  Delhi: { lat: "28.6139° N", lng: "77.2090° E" },
  Mumbai: { lat: "19.0760° N", lng: "72.8777° E" },
  Jaipur: { lat: "26.9124° N", lng: "75.7873° E" },
  Bangalore: { lat: "12.9716° N", lng: "77.5946° E" },
};

const MiniMap = ({ city }: MiniMapProps) => {
  const coords = cityCoords[city] || cityCoords.Delhi;

  return (
    <div className="glass-card-strong p-6 space-y-3 hover-glow">
      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        Monitoring Station
      </h2>
      <div className="relative w-full h-48 rounded-xl bg-secondary/50 overflow-hidden border border-border/30">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }} />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-muted-foreground/20" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-muted-foreground/20" />
        <div className="absolute top-1/3 left-0 right-0 h-px bg-muted-foreground/10 rotate-12 origin-center" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-primary border-2 border-foreground/50 animate-pulse shadow-lg" />
          <div className="w-2 h-2 rounded-full bg-primary mt-1 opacity-40 animate-ping" />
        </div>
        <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg glass-card text-[10px] text-muted-foreground">
          {coords.lat}, {coords.lng}
        </div>
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg glass-card text-[10px] font-semibold text-foreground">
          {city}
        </div>
      </div>
    </div>
  );
};

export default MiniMap;
