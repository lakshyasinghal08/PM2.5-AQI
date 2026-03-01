import { useState, useEffect, useMemo } from "react";
import { Navigation, MapPin, Clock, TrendingDown } from "lucide-react";

interface AreaData {
  name: string;
  x: number;
  y: number;
  aqi: number;
  history: number[];
}

interface PollutionEscapePlannerProps {
  areas: AreaData[];
  selectedArea: AreaData | null;
}

const PollutionEscapePlanner = ({ areas, selectedArea }: PollutionEscapePlannerProps) => {
  const recommendation = useMemo(() => {
    if (!selectedArea || areas.length < 2) return null;
    const others = areas.filter(a => a.name !== selectedArea.name);
    const cleanest = others.reduce((best, cur) => cur.aqi < best.aqi ? cur : best, others[0]);
    const dx = cleanest.x - selectedArea.x;
    const dy = cleanest.y - selectedArea.y;
    const dist = Math.round(Math.sqrt(dx * dx + dy * dy) * 0.3 + 2);
    const angle = Math.atan2(-dy, dx) * (180 / Math.PI);
    const dirs = ["East", "North-East", "North", "North-West", "West", "South-West", "South", "South-East"];
    const dir = dirs[Math.round(((angle + 360) % 360) / 45) % 8];
    const improvement = Math.round(((selectedArea.aqi - cleanest.aqi) / selectedArea.aqi) * 100);
    const travelMin = Math.round(dist * 3.5);
    return { area: cleanest, distance: dist, direction: dir, improvement, travelMin };
  }, [areas, selectedArea]);

  if (!recommendation || recommendation.improvement <= 0) return null;

  return (
    <div className="glass-card p-4 space-y-3 border border-aqi-good/30">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Navigation className="w-4 h-4 text-aqi-good" />
        Pollution Escape Planner
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Cleaner air available <span className="text-aqi-good font-bold">{recommendation.distance} km {recommendation.direction}</span>
      </p>
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card p-2 text-center rounded-lg">
          <MapPin className="w-3 h-3 mx-auto text-primary mb-1" />
          <p className="text-[10px] text-muted-foreground">Distance</p>
          <p className="text-xs font-bold text-foreground">{recommendation.distance} km</p>
        </div>
        <div className="glass-card p-2 text-center rounded-lg">
          <TrendingDown className="w-3 h-3 mx-auto text-aqi-good mb-1" />
          <p className="text-[10px] text-muted-foreground">AQI Drop</p>
          <p className="text-xs font-bold text-aqi-good">{recommendation.improvement}%</p>
        </div>
        <div className="glass-card p-2 text-center rounded-lg">
          <Clock className="w-3 h-3 mx-auto text-aqi-moderate mb-1" />
          <p className="text-[10px] text-muted-foreground">Travel</p>
          <p className="text-xs font-bold text-foreground">{recommendation.travelMin} min</p>
        </div>
      </div>
      <button className="w-full py-2 rounded-xl bg-aqi-good/15 text-aqi-good text-xs font-semibold hover:bg-aqi-good/25 transition-colors border border-aqi-good/30 flex items-center justify-center gap-1.5">
        <Navigation className="w-3 h-3" />
        Navigate to {recommendation.area.name}
      </button>
    </div>
  );
};

export default PollutionEscapePlanner;
