import { useEffect, useState } from "react";
import { getAqiCategory } from "@/lib/cityData";

interface PollutantData {
  name: string;
  value: number;
  max: number;
  unit: string;
}

interface PollutantMShapeProps {
  aqi: number;
  pm25: number;
  co2: number;
  humidity: number;
  temp: number;
}

const getColorForValue = (value: number) => {
  if (value <= 50) return { ring: "text-aqi-good", glow: "glow-green" };
  if (value <= 100) return { ring: "text-aqi-moderate", glow: "glow-yellow" };
  if (value <= 150) return { ring: "text-aqi-poor", glow: "glow-orange" };
  if (value <= 200) return { ring: "text-aqi-severe", glow: "glow-red" };
  return { ring: "text-aqi-danger", glow: "glow-purple" };
};

const CircularMeter = ({
  label,
  value,
  max,
  unit,
  size = 100,
  strokeWidth = 6,
  delay = 0,
  isMain = false,
  colorValue,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  size?: number;
  strokeWidth?: number;
  delay?: number;
  isMain?: boolean;
  colorValue?: number;
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.min(value / max, 1);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(normalizedValue), delay);
    return () => clearTimeout(timer);
  }, [normalizedValue, delay]);

  const strokeDashoffset = circumference * (1 - animatedValue);
  const displayVal = Math.round(value);
  const safeColorVal = Math.max(0, Math.min(colorValue ?? displayVal, 500));
  const colors = getColorForValue(safeColorVal);
  const cat = isMain ? getAqiCategory(displayVal) : null;

  const getStrokeColor = (val: number) => {
    if (val <= 50) return "hsl(var(--aqi-good))";
    if (val <= 100) return "hsl(var(--aqi-moderate))";
    if (val <= 150) return "hsl(var(--aqi-poor))";
    if (val <= 200) return "hsl(var(--aqi-severe))";
    return "hsl(var(--aqi-danger))";
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${colors.glow} rounded-full transition-all duration-500 hover:scale-105 cursor-default`}
      style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeWidth} opacity={0.3} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={getStrokeColor(safeColorVal)}
          strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="relative z-10 text-center">
        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider block">{label}</span>
        <span className={`${isMain ? "text-3xl md:text-4xl" : "text-lg md:text-xl"} font-bold font-mono ${colors.ring} transition-colors duration-500 block`}>
          {displayVal}
        </span>
        {isMain && cat ? (
          <span className={`text-[9px] font-medium ${cat.color} block`}>{cat.label}</span>
        ) : (
          <span className="text-[8px] text-muted-foreground block">{unit}</span>
        )}
      </div>
    </div>
  );
};

const PollutantMShape = ({ aqi, pm25, co2, humidity, temp }: PollutantMShapeProps) => {
  const pm10 = Math.round(pm25 * 1.6 + (Math.random() - 0.5) * 10);
  const no2 = Math.round(aqi * 0.22 + (Math.random() - 0.5) * 5);
  const o3 = Math.round(aqi * 0.18 + (Math.random() - 0.5) * 4);
  const co2ColorVal = co2 > 600 ? 150 : co2 > 400 ? 80 : 30;

  return (
    <div className="glass-card-strong p-6 md:p-8 space-y-6">
      <h2 className="section-title text-foreground text-center">Pollutant Levels</h2>

      {/* M-Shape Layout */}
      <div className="flex flex-col items-center gap-4 md:gap-6">
        {/* Top row: PM2.5 - Main AQI - CO₂ */}
        <div className="flex items-end justify-center gap-4 md:gap-8">
          <CircularMeter label="PM2.5" value={pm25} max={250} unit="µg/m³" size={90} strokeWidth={5} delay={100} />
          <CircularMeter label="AQI" value={aqi} max={500} unit="" size={140} strokeWidth={8} delay={0} isMain />
          <CircularMeter label="CO₂" value={co2} max={2000} unit="ppm" size={90} strokeWidth={5} delay={200} colorValue={co2ColorVal} />
        </div>

        {/* Bottom row: PM10 - NO₂ - O₃ */}
        <div className="flex items-start justify-center gap-4 md:gap-8 -mt-2">
          <CircularMeter label="PM10" value={pm10} max={350} unit="µg/m³" size={80} strokeWidth={5} delay={300} />
          <div className="w-16 md:w-24" />
          <CircularMeter label="NO₂" value={no2} max={200} unit="ppb" size={80} strokeWidth={5} delay={400} />
          <div className="w-16 md:w-24" />
          <CircularMeter label="O₃" value={o3} max={200} unit="ppb" size={80} strokeWidth={5} delay={500} />
        </div>

        {/* Extra row: Humidity & Temperature */}
        <div className="flex items-center justify-center gap-6 md:gap-10 mt-2">
          <CircularMeter label="Humidity" value={humidity} max={100} unit="%" size={80} strokeWidth={5} delay={600} />
          <CircularMeter label="Temp" value={temp} max={55} unit="°C" size={80} strokeWidth={5} delay={700} />
        </div>
      </div>
    </div>
  );
};

export default PollutantMShape;
