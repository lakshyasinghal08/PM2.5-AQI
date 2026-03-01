import { Droplets, Wind, Thermometer } from "lucide-react";
import { getAqiCategory } from "@/lib/cityData";

interface AirSafetyScoreProps {
  pm25: number;
  co2: number;
  humidity: number;
}

const AirSafetyScore = ({ pm25, co2, humidity }: AirSafetyScoreProps) => {
  const metrics = [
    { label: "PM2.5", value: `${pm25} µg/m³`, icon: Wind, cat: getAqiCategory(pm25 > 60 ? 180 : pm25 > 30 ? 100 : 40) },
    { label: "CO₂", value: `${co2} ppm`, icon: Thermometer, cat: getAqiCategory(co2 > 600 ? 150 : co2 > 400 ? 80 : 30) },
    { label: "Humidity", value: `${humidity}%`, icon: Droplets, cat: getAqiCategory(30) },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {metrics.map((m) => (
        <div key={m.label} className="glass-card-strong p-5 text-center space-y-2 hover-glow">
          <m.icon className={`w-6 h-6 mx-auto ${m.cat.color}`} />
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{m.label}</p>
          <p className={`text-2xl font-bold font-mono ${m.cat.color}`}>{m.value}</p>
        </div>
      ))}
    </div>
  );
};

export default AirSafetyScore;
