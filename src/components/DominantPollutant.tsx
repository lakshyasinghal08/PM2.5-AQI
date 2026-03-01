import { Target } from "lucide-react";

interface DominantPollutantProps {
  pm25: number;
  co2: number;
  aqi: number;
}

const DominantPollutant = ({ pm25, co2, aqi }: DominantPollutantProps) => {
  const pm10 = Math.round(pm25 * 1.6);
  const no2 = Math.round(aqi * 0.22);

  const pollutants = [
    { name: "PM2.5", value: pm25 },
    { name: "PM10", value: pm10 },
    { name: "NO₂", value: no2 },
    { name: "CO₂", value: co2 },
  ];

  const dominant = pollutants.reduce((a, b) => (a.value > b.value ? a : b));

  return (
    <div className="glass-card-strong p-6 space-y-3 hover-glow border border-aqi-severe/30">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-aqi-severe/15 flex items-center justify-center">
          <Target className="w-4 h-4 text-aqi-severe" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Main Pollutant Affecting AQI</h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-3xl font-bold font-mono text-aqi-severe">{dominant.name}</span>
        <div>
          <p className="text-lg font-semibold text-foreground">{dominant.value}</p>
          <p className="text-xs text-muted-foreground">
            {dominant.name} is highest and contributing most to AQI
          </p>
        </div>
      </div>
    </div>
  );
};

export default DominantPollutant;
