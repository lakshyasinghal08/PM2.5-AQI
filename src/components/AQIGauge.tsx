import { useEffect, useState } from "react";

interface AQIGaugeProps {
  value: number;
}

const AQIGauge = ({ value }: AQIGaugeProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const target = value;
    const step = () => {
      setAnimatedValue((prev) => {
        const diff = target - prev;
        if (Math.abs(diff) < 1) return target;
        return prev + diff * 0.08;
      });
    };
    const interval = setInterval(step, 20);
    return () => clearInterval(interval);
  }, [value]);

  const maxVal = 500;
  const angle = (animatedValue / maxVal) * 180; // 0-180 degrees
  const needleAngle = -90 + angle; // -90 is left, +90 is right

  const getColor = (val: number) => {
    if (val <= 50) return "text-aqi-good";
    if (val <= 100) return "text-aqi-moderate";
    if (val <= 200) return "text-aqi-poor";
    return "text-aqi-severe";
  };

  const getLabel = (val: number) => {
    if (val <= 50) return "Good";
    if (val <= 100) return "Moderate";
    if (val <= 200) return "Unhealthy";
    return "Severe";
  };

  return (
    <div className="glass-card-strong p-6 space-y-2 hover-glow flex flex-col items-center">
      <h2 className="section-title text-foreground text-center">AQI Gauge</h2>
      <div className="relative w-56 h-32">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Background arc segments */}
          <path d="M 20 100 A 80 80 0 0 1 65 30" fill="none" stroke="hsl(var(--aqi-good))" strokeWidth="10" strokeLinecap="round" opacity="0.3" />
          <path d="M 65 30 A 80 80 0 0 1 100 20" fill="none" stroke="hsl(var(--aqi-moderate))" strokeWidth="10" strokeLinecap="round" opacity="0.3" />
          <path d="M 100 20 A 80 80 0 0 1 135 30" fill="none" stroke="hsl(var(--aqi-poor))" strokeWidth="10" strokeLinecap="round" opacity="0.3" />
          <path d="M 135 30 A 80 80 0 0 1 180 100" fill="none" stroke="hsl(var(--aqi-severe))" strokeWidth="10" strokeLinecap="round" opacity="0.3" />
          {/* Needle */}
          <g transform={`rotate(${needleAngle}, 100, 100)`} style={{ transition: "transform 0.5s ease-out" }}>
            <line x1="100" y1="100" x2="100" y2="30" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="100" cy="100" r="5" fill="hsl(var(--primary))" />
          </g>
          {/* Labels */}
          <text x="15" y="108" fontSize="8" fill="hsl(var(--muted-foreground))">0</text>
          <text x="175" y="108" fontSize="8" fill="hsl(var(--muted-foreground))">500</text>
        </svg>
      </div>
      <div className="text-center -mt-2">
        <p className={`text-3xl font-bold font-mono ${getColor(value)} transition-colors duration-500`}>
          {Math.round(animatedValue)}
        </p>
        <p className={`text-xs font-semibold ${getColor(value)}`}>{getLabel(value)}</p>
      </div>
    </div>
  );
};

export default AQIGauge;
