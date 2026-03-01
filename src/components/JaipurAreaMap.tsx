import { useState, useEffect, useCallback, useMemo } from "react";
import { MapPin, Heart, Shield, Wind, Layers, AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { getCityAreas, getCityState } from "@/lib/cityAreaData";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import PollutionEscapePlanner from "@/components/PollutionEscapePlanner";
import SafeOutdoorTimePredictor from "@/components/SafeOutdoorTimePredictor";
import PollutionExposureCalculator from "@/components/PollutionExposureCalculator";

// ── Types ──
export interface AreaData {
  name: string;
  x: number;
  y: number;
  aqi: number;
  history: number[];
}

type MapView = "markers" | "heatmap" | "satellite";

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

const generate24hPrediction = (currentAqi: number) => {
  const data = [];
  let val = currentAqi;
  for (let i = 0; i < 24; i++) {
    val = Math.max(20, Math.min(400, val + Math.floor((Math.random() - 0.48) * 35)));
    data.push({ hour: `${i}h`, aqi: val });
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

// ── Heatmap Blob ──
const HeatmapBlob = ({ area }: { area: AreaData }) => {
  const intensity = Math.min(area.aqi / 300, 1);
  const radius = 60 + intensity * 80;
  const color = getAqiColor(area.aqi);
  return (
    <div className="absolute rounded-full transition-all duration-1000 pointer-events-none"
      style={{
        left: `${area.x}%`, top: `${area.y}%`,
        transform: "translate(-50%, -50%)",
        width: radius, height: radius,
        background: `radial-gradient(circle, ${color.hex}88 0%, ${color.hex}44 40%, ${color.hex}11 70%, transparent 100%)`,
        filter: `blur(${8 + intensity * 12}px)`,
      }}
    />
  );
};

// ── View Toggle ──
const ViewToggle = ({ view, onChange }: { view: MapView; onChange: (v: MapView) => void }) => {
  const views: { id: MapView; label: string }[] = [
    { id: "markers", label: "Markers" },
    { id: "heatmap", label: "Heatmap" },
    { id: "satellite", label: "Satellite" },
  ];
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/60 backdrop-blur-md border border-border/40">
      {views.map(v => (
        <button key={v.id} onClick={() => onChange(v.id)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300 ${
            view === v.id ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
          }`}>
          {v.label}
        </button>
      ))}
    </div>
  );
};

// ── Main Component ──
interface JaipurAreaMapProps {
  city: string;
  onAreasUpdate?: (areas: AreaData[]) => void;
}

const JaipurAreaMap = ({ city, onAreasUpdate }: JaipurAreaMapProps) => {
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [fadeIn, setFadeIn] = useState(true);
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<AreaData | null>(null);
  const [mapView, setMapView] = useState<MapView>("markers");
  const [prediction24h, setPrediction24h] = useState<{ hour: string; aqi: number }[]>([]);
  const [cleanestHighlight, setCleanestHighlight] = useState<string | null>(null);

  const initAreas = useCallback((cityName: string) => {
    return getCityAreas(cityName).map(a => {
      const aqi = Math.floor(Math.random() * 250) + 50;
      return { ...a, aqi, history: Array.from({ length: 12 }, () => Math.floor(Math.random() * 200) + 40) };
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
  }, [city, initAreas]);

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
        setPrediction24h(generate24hPrediction(updated.aqi));
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

  const isSatellite = mapView === "satellite";
  const showHeatmap = mapView === "heatmap";

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
          <ViewToggle view={mapView} onChange={setMapView} />
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
      <div className={`relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-border/30 transition-all duration-500 ${fadeIn ? "opacity-100" : "opacity-0"} ${
        isSatellite ? "bg-[hsl(220_30%_6%)]" : "bg-secondary/40"
      }`}>
        {!isSatellite && (
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }} />
        )}

        {isSatellite && (
          <div className="absolute inset-0 opacity-20" style={{
            background: "radial-gradient(ellipse at 30% 40%, hsl(var(--aqi-good) / 0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, hsl(var(--primary) / 0.1) 0%, transparent 50%)"
          }} />
        )}

        <svg className="absolute inset-0 w-full h-full opacity-15" preserveAspectRatio="none" viewBox="0 0 100 100">
          <line x1="10" y1="50" x2="90" y2="50" stroke="hsl(var(--muted-foreground))" strokeWidth="0.4" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="hsl(var(--muted-foreground))" strokeWidth="0.4" />
          <line x1="20" y1="20" x2="80" y2="80" stroke="hsl(var(--muted-foreground))" strokeWidth="0.2" />
          <line x1="80" y1="20" x2="20" y2="80" stroke="hsl(var(--muted-foreground))" strokeWidth="0.2" />
          <circle cx="50" cy="45" r="18" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.3" />
        </svg>

        {showHeatmap && areas.map(area => <HeatmapBlob key={area.name} area={area} />)}

        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl glass-card-strong text-[11px] font-bold text-foreground flex items-center gap-1.5 z-20">
          <MapPin className="w-3 h-3 text-primary" />
          {city}, {getCityState(city)}
        </div>

        {/* Markers */}
        {areas.map(area => {
          const color = getAqiColor(area.aqi);
          const isHovered = hoveredArea === area.name;
          const isRedZone = area.aqi > 200;
          const isCleanest = cleanestHighlight === area.name;
          return (
            <div key={area.name} className="absolute cursor-pointer transition-all duration-500 z-10"
              style={{ left: `${area.x}%`, top: `${area.y}%`, transform: "translate(-50%, -50%)" }}
              onMouseEnter={() => setHoveredArea(area.name)}
              onMouseLeave={() => setHoveredArea(null)}
              onClick={() => { setSelectedArea(area); setPrediction24h(generate24hPrediction(area.aqi)); }}>
              {/* Green glow for cleanest */}
              {isCleanest && (
                <div className="absolute rounded-full animate-ping opacity-40"
                  style={{ backgroundColor: "#22c55e", width: 40, height: 40, margin: "auto", inset: 0 }} />
              )}
              <div className="absolute inset-0 rounded-full animate-ping opacity-25 transition-colors duration-1000"
                style={{ backgroundColor: color.stroke, width: 24, height: 24, margin: "auto", inset: 0 }} />
              <div className={`relative z-10 rounded-full border-2 border-background flex items-center justify-center transition-all duration-300 ${
                isHovered ? "scale-[1.4]" : "scale-100"
              } ${showHeatmap ? "w-4 h-4" : "w-7 h-7"}`} style={{ backgroundColor: color.stroke }}>
                {!showHeatmap && <span className="text-[7px] font-bold text-background">{area.aqi}</span>}
              </div>
              {isRedZone && !showHeatmap && (
                <AlertTriangle className="absolute -top-1 -right-1 w-3 h-3 text-aqi-severe z-20 animate-pulse" />
              )}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-30 animate-fade-in">
                  <div className="glass-card-strong rounded-xl p-3 min-w-[160px] border border-border/50 shadow-2xl space-y-2">
                    <p className="text-xs font-bold text-foreground">{area.name}</p>
                    <div className="flex items-center gap-2">
                      <CircularAqi aqi={area.aqi} size={38} />
                      <div>
                        <p className={`text-sm font-bold ${color.text}`}>{area.aqi}</p>
                        <p className="text-[9px] text-muted-foreground">{color.label}</p>
                      </div>
                    </div>
                    {isRedZone && (
                      <p className="text-[9px] text-aqi-severe font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Red Zone
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
