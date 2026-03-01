import { useState, useEffect } from "react";
import { MapPin, Cloud, Radio, ChevronDown } from "lucide-react";
import { cities } from "@/lib/cityData";

interface LocationBarProps {
  city: string;
  weather: string;
  temp: number;
  onCityChange: (city: string) => void;
}

const LocationBar = ({ city, weather, temp, onCityChange }: LocationBarProps) => {
  const [time, setTime] = useState(new Date());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card px-4 py-2.5 flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <MapPin className="w-3.5 h-3.5 text-primary" />
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors"
          >
            {city}, India
            <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="absolute top-full left-0 mt-1 w-40 rounded-xl glass-card-strong border border-border/50 shadow-xl z-50 overflow-hidden animate-fade-in">
              {cities.map((c) => (
                <button
                  key={c}
                  onClick={() => { onCityChange(c); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors ${c === city ? "text-primary font-semibold" : "text-foreground"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Cloud className="w-3.5 h-3.5 text-aqi-moderate" />
          <span>{temp}°C, {weather}</span>
        </div>
        <span className="font-mono hidden sm:inline">
          {time.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          {" · "}
          {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-aqi-good/10">
          <Radio className="w-3 h-3 text-aqi-good animate-pulse" />
          <span className="font-bold text-aqi-good uppercase tracking-wider blink">Live</span>
        </div>
      </div>
    </div>
  );
};

export default LocationBar;
