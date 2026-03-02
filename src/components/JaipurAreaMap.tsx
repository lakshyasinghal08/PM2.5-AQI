import { useState, useEffect, useCallback, useMemo } from "react";
import { MapPin, Heart, Shield, Wind, Layers, AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { getCityAreas, getCityState } from "@/lib/cityAreaData";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import PollutionEscapePlanner from "@/components/PollutionEscapePlanner";
import SafeOutdoorTimePredictor from "@/components/SafeOutdoorTimePredictor";
import PollutionExposureCalculator from "@/components/PollutionExposureCalculator";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import { CITY_COORDINATES } from "@/lib/api";

// ── Types ──
export interface AreaData {
  name: string;
  x: number;
  y: number;
  aqi: number;
  history: number[];
}

type MapView = "default";

// ── AQI Helpers ──
const getAqiColor = (aqi: number) => {
  if (aqi <= 50) return { stroke: "hsl(var(--aqi-good))", label: "Good", bg: "bg-aqi-good/15", text: "text-aqi-good", hex: "#22c55e" };
  if (aqi <= 100) return { stroke: "hsl(var(--aqi-moderate))", label: "Moderate", bg: "bg-aqi-moderate/15", text: "text-aqi-moderate", hex: "#eab308" };
  if (aqi <= 150) return { stroke: "hsl(var(--aqi-poor))", label: "Unhealthy (SG)", bg: "bg-aqi-poor/15", text: "text-aqi-poor", hex: "#f97316" };
  if (aqi <= 200) return { stroke: "hsl(var(--aqi-severe))", label: "Unhealthy", bg: "bg-aqi-severe/15", text: "text-aqi-severe", hex: "#ef4444" };
  if (aqi <= 300) return { stroke: "hsl(var(--aqi-danger))", label: "Hazardous", bg: "bg-aqi-danger/15", text: "text-aqi-danger", hex: "#a855f7" };
  return { stroke: "hsl(0 60% 30%)", label: "Hazardous+", bg: "bg-destructive/15", text: "text-destructive", hex: "#7f1d1d" };
};

const getHealthImpact = (aqi: number) => {
  if (aqi <= 50) return "Air quality is satisfactory. No health risks.";
  if (aqi <= 100) return "Acceptable quality. Sensitive individuals should limit prolonged outdoor exertion.";
  if (aqi <= 150) return "Members of sensitive groups may experience health effects.";
  if (aqi <= 200) return "Everyone may begin to experience adverse health effects.";
  return "Health alert: serious risk of respiratory & cardiovascular effects for all.";
};

const getSafetySuggestion = (aqi: number) => {
  if (aqi <= 50) return "Enjoy outdoor activities freely. Great day for exercise!";
  if (aqi <= 100) return "Outdoor activities are fine. Sensitive groups should take breaks.";
  if (aqi <= 150) return "Reduce prolonged outdoor exertion. Wear a mask if sensitive.";
  if (aqi <= 200) return "Avoid outdoor exercise. Use N95 masks outdoors. Run air purifiers indoors.";
  return "Stay indoors. Keep windows closed. Use air purifiers at maximum.";
};

const getMarkerColor = (aqi: number) => {
  if (aqi <= 100) return "#22c55e"; // green - normal
  if (aqi <= 200) return "#f97316"; // orange - moderate
  return "#ef4444"; // red - high
};

// Simple linear regression forecast based on recent AQI history
const generateRegressionForecast = (history: number[]) => {
  if (history.length === 0) return [];

  const n = history.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const ys = history;

  const sumX = xs.reduce((s, v) => s + v, 0);
  const sumY = ys.reduce((s, v) => s + v, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const sumX2 = xs.reduce((s, x) => s + x * x, 0);

  const denom = n * sumX2 - sumX * sumX || 1;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  const lastIndex = xs[xs.length - 1];

  const data = [];
  for (let i = 1; i <= 24; i++) {
    const x = lastIndex + i;
    const raw = slope * x + intercept;
    const clamped = Math.max(20, Math.min(400, raw));
    data.push({ hour: `${i}h`, aqi: Math.round(clamped) });
  }
  return data;
};

// ── Circular AQI ──
const CircularAqi = ({ aqi, size = 64 }: { aqi: number; size?: number }) => {
  const color = getAqiColor(aqi);
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const progress = Math.min(aqi / 500, 1);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={4} opacity={0.3} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color.stroke} strokeWidth={4} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - progress)} className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold font-mono ${color.text}`} style={{ fontSize: size * 0.28 }}>{aqi}</span>
      </div>
    </div>
  );
};

// ── Main Component ──
interface JaipurAreaMapProps {
  city: string;
  onAreasUpdate?: (areas: AreaData[]) => void;
}

const JaipurAreaMap = ({ city, onAreasUpdate }: JaipurAreaMapProps) => {
  const SENSOR_COUNT = 100;
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [fadeIn, setFadeIn] = useState(true);
  const [selectedArea, setSelectedArea] = useState<AreaData | null>(null);
  const [mapView] = useState<MapView>("default");
  const [prediction24h, setPrediction24h] = useState<{ hour: string; aqi: number }[]>([]);
  const [cleanestHighlight, setCleanestHighlight] = useState<string | null>(null);
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const initAreas = useCallback((cityName: string) => {
    const baseAreas = getCityAreas(cityName);
    if (baseAreas.length === 0) return [];

    return Array.from({ length: SENSOR_COUNT }, () => {
      const base = baseAreas[Math.floor(Math.random() * baseAreas.length)];
      const aqi = Math.floor(Math.random() * 250) + 50;
      const jitterX = (Math.random() - 0.5) * 6; // small jitter so markers don't fully overlap
      const jitterY = (Math.random() - 0.5) * 6;
      return {
        name: base.name,
        x: Math.min(95, Math.max(5, base.x + jitterX)),
        y: Math.min(95, Math.max(5, base.y + jitterY)),
        aqi,
        history: Array.from({ length: 12 }, () => Math.floor(Math.random() * 200) + 40),
      };
    });
  }, []);

  useEffect(() => {
    setFadeIn(false);
    const t = setTimeout(() => {
      const newAreas = initAreas(city);
      setAreas(newAreas);
      onAreasUpdate?.(newAreas);
      setFadeIn(true);
      setSelectedArea(null);
    }, 250);
    return () => clearTimeout(t);
  }, [city, initAreas, onAreasUpdate]);

  const randomize = useCallback(() => {
    setAreas(prev => {
      const updated = prev.map(a => {
        const newAqi = Math.max(30, Math.min(400, a.aqi + Math.floor((Math.random() - 0.5) * 50)));
        return { ...a, aqi: newAqi, history: [...a.history.slice(1), newAqi] };
      });
      return updated;
    });
  }, []);

  useEffect(() => {
    const i = setInterval(randomize, 7000);
    return () => clearInterval(i);
  }, [randomize]);

  // Propagate areas updates
  useEffect(() => {
    if (areas.length > 0) onAreasUpdate?.(areas);
  }, [areas]);

  useEffect(() => {
    if (selectedArea) {
      const updated = areas.find(a => a.name === selectedArea.name);
      if (updated) {
        setSelectedArea(updated);
        setPrediction24h(generateRegressionForecast(updated.history));
      }
    }
  }, [areas]);

  // Find cleanest for escape planner highlight
  useEffect(() => {
    if (selectedArea && areas.length > 1) {
      const others = areas.filter(a => a.name !== selectedArea.name);
      const cleanest = others.reduce((best, cur) => cur.aqi < best.aqi ? cur : best, others[0]);
      setCleanestHighlight(cleanest.name);
    } else {
      setCleanestHighlight(null);
    }
  }, [selectedArea, areas]);

  const riskAreas = useMemo(() => areas.filter(a => a.aqi > 200), [areas]);
  const avgAqi = useMemo(() => Math.round(areas.reduce((s, a) => s + a.aqi, 0) / (areas.length || 1)), [areas]);

  const mapCenter = useMemo(() => {
    const base = CITY_COORDINATES[city] || { lat: 28.6139, lon: 77.209 };
    return { lat: base.lat, lng: base.lon };
  }, [city]);

  return (
    <div className="glass-card-strong p-6 space-y-4 hover-glow">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Geographic Intelligence — {city}
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Real-time pollution zones · {areas.length} sensors · Avg AQI {avgAqi}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground px-2 py-1 rounded-full bg-secondary/60 border border-border/30">
            Live · 7s
          </span>
        </div>
      </div>

      {/* Risk Alerts */}
      {riskAreas.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-aqi-severe/10 border border-aqi-severe/30 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-aqi-severe flex-shrink-0" />
          <p className="text-[11px] text-aqi-severe font-medium">
            <span className="font-bold">{riskAreas.length} Red Zone{riskAreas.length > 1 ? "s" : ""}</span> detected: {riskAreas.slice(0, 4).map(a => a.name).join(", ")}{riskAreas.length > 4 ? ` +${riskAreas.length - 4} more` : ""}
          </p>
        </div>
      )}

      {/* Map */}
      <div
        className={`relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-border/30 transition-all duration-500 ${
          fadeIn ? "opacity-100" : "opacity-0"
        } bg-secondary/40`}
      >
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl glass-card-strong text-[11px] font-bold text-foreground flex items-center gap-1.5 z-20">
          <MapPin className="w-3 h-3 text-primary" />
          {city}, {getCityState(city)}
        </div>

        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-destructive bg-background/80">
            Unable to load Google Maps. Please check your API key.
          </div>
        )}

        {!loadError && !isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            Loading Google Map...
          </div>
        )}

        {isLoaded && (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={mapCenter}
            zoom={11}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            {areas.map(area => {
              const latOffset = (area.y - 50) * 0.02;
              const lonOffset = (area.x - 50) * 0.02;
              const position = {
                lat: mapCenter.lat + latOffset,
                lng: mapCenter.lng + lonOffset,
              };
              const color = getMarkerColor(area.aqi);
              const icon = {
                path: "M12 2C8.13 2 5 5.13 5 9c0 4.17 5.4 10.39 6.27 11.34.2.22.54.22.74 0C13.6 19.39 19 13.17 19 9c0-3.87-3.13-7-7-7z",
                fillColor: color,
                fillOpacity: 0.95,
                strokeColor: "#020617",
                strokeWeight: 1.2,
                scale: 1.3,
                anchor: { x: 12, y: 22 },
              } as any;
              return (
                <Marker
                  key={area.name}
                  position={position}
                  onClick={() => setSelectedArea(area)}
                  icon={icon}
                  label={{
                    text: String(area.aqi),
                    className: "text-[10px] font-bold text-white",
                  } as any}
                />
              );
            })}
          </GoogleMap>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        {[
          { label: "Good (0-50)", cls: "bg-aqi-good" },
          { label: "Moderate (51-100)", cls: "bg-aqi-moderate" },
          { label: "Unhealthy (101-200)", cls: "bg-aqi-poor" },
          { label: "Severe (201-300)", cls: "bg-aqi-severe" },
          { label: "Hazardous (301+)", cls: "bg-aqi-danger" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-full ${l.cls}`} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Side Panel */}
      <Sheet open={!!selectedArea} onOpenChange={open => !open && setSelectedArea(null)}>
        <SheetContent className="glass-card-strong border-l border-border/50 w-[360px] sm:w-[420px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {selectedArea?.name}
            </SheetTitle>
            <SheetDescription>Real-time air quality intelligence</SheetDescription>
          </SheetHeader>

          {selectedArea && (() => {
            const color = getAqiColor(selectedArea.aqi);
            const isRedZone = selectedArea.aqi > 200;
            return (
              <div className="mt-6 space-y-4">
                {isRedZone && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-aqi-severe/10 border border-aqi-severe/30">
                    <AlertTriangle className="w-4 h-4 text-aqi-severe" />
                    <span className="text-xs font-bold text-aqi-severe">Red Zone — Avoid outdoor exposure</span>
                  </div>
                )}

                <div className="flex flex-col items-center gap-3">
                  <CircularAqi aqi={selectedArea.aqi} size={110} />
                  <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${color.bg} ${color.text}`}>
                    {color.label}
                  </span>
                </div>

                {/* Escape Planner */}
                <PollutionEscapePlanner areas={areas} selectedArea={selectedArea} />

                {/* Safe Outdoor Time */}
                <SafeOutdoorTimePredictor aqi={selectedArea.aqi} prediction24h={prediction24h} />

                {/* 24h Prediction */}
                <div className="glass-card p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Activity className="w-4 h-4 text-primary" />
                    24-Hour AQI Forecast
                  </div>
                  <div className="h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={prediction24h}>
                        <defs>
                          <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color.hex} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={color.hex} stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={5} />
                        <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={30} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} />
                        <Area type="monotone" dataKey="aqi" stroke={color.hex} fill="url(#predGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    {prediction24h.length > 0 && prediction24h[23]?.aqi < selectedArea.aqi ? (
                      <><TrendingDown className="w-3 h-3 text-aqi-good" /><span className="text-aqi-good font-semibold">Improving trend</span></>
                    ) : (
                      <><TrendingUp className="w-3 h-3 text-aqi-severe" /><span className="text-aqi-severe font-semibold">Worsening trend</span></>
                    )}
                  </div>
                </div>

                {/* Exposure Calculator */}
                <PollutionExposureCalculator aqi={selectedArea.aqi} />

                {/* Health */}
                <div className="glass-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Heart className="w-4 h-4 text-aqi-severe" /> Health Impact
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{getHealthImpact(selectedArea.aqi)}</p>
                </div>

                <div className="glass-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Shield className="w-4 h-4 text-primary" /> Safety Suggestion
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{getSafetySuggestion(selectedArea.aqi)}</p>
                </div>

                <div className="glass-card p-4 flex items-center gap-3">
                  <Wind className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Wind Speed</p>
                    <p className="text-xs text-muted-foreground">
                      {(Math.random() * 15 + 2).toFixed(1)} km/h — {["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(Math.random() * 8)]}
                    </p>
                  </div>
                </div>

                <div className="glass-card p-4 space-y-2">
                  <p className="text-xs font-semibold text-foreground">Recent History (12 readings)</p>
                  <div className="h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedArea.history.map((v, i) => ({ i, aqi: v }))}>
                        <Area type="monotone" dataKey="aqi" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default JaipurAreaMap;
