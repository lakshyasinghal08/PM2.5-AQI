import { AlertTriangle } from "lucide-react";

interface AQIAlertProps {
  aqi: number;
}

const AQIAlert = ({ aqi }: AQIAlertProps) => {
  if (aqi <= 200) return null;

  const isHazardous = aqi > 300;
  const message = isHazardous
    ? "Hazardous Air – Avoid Going Outside"
    : "Severe Air Quality Alert";
  const description = isHazardous
    ? "Air quality is hazardous. Everyone should stay indoors and use air purifiers."
    : "Air quality is severe. Sensitive groups must avoid outdoor exposure.";

  return (
    <div
      className={`glass-card-strong p-4 flex items-center gap-3 border-2 ${isHazardous ? "border-aqi-danger" : "border-aqi-severe"} animate-fade-in`}
      style={{ animation: "fade-in 0.5s ease-out, alertBlink 2s ease-in-out infinite" }}
    >
      <div className={`w-10 h-10 rounded-xl ${isHazardous ? "bg-aqi-danger/15" : "bg-aqi-severe/15"} flex items-center justify-center flex-shrink-0`}>
        <AlertTriangle className={`w-5 h-5 ${isHazardous ? "text-aqi-danger animate-pulse" : "text-aqi-severe animate-pulse"}`} />
      </div>
      <div>
        <p className={`text-sm font-semibold ${isHazardous ? "text-aqi-danger" : "text-aqi-severe"}`}>⚠ {message}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default AQIAlert;
