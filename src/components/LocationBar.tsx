import { useState, useEffect } from "react";
import { MapPin, Cloud, Radio } from "lucide-react";

interface LocationBarProps {
  city: string;
  weather: string;
  temp: number;
}

const LocationBar = ({ city, weather, temp }: LocationBarProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card px-4 py-2.5 flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <MapPin className="w-3.5 h-3.5 text-primary" />
        <span className="font-medium text-foreground">
          {city}, India
        </span>
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
