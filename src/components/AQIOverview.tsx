import { useEffect, useState } from "react";
import { ShieldAlert, Radio } from "lucide-react";
import { getAqiCategory } from "@/lib/cityData";

interface AQIOverviewProps {
  aqi: number;
}

const AQIOverview = ({ aqi }: AQIOverviewProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const cat = getAqiCategory(aqi);

  useEffect(() => {
    if (displayValue === aqi) return;
    const step = displayValue < aqi ? 1 : -1;
    const timer = setTimeout(() => setDisplayValue((v) => v + step), 12);
    return () => clearTimeout(timer);
  }, [displayValue, aqi]);

  useEffect(() => {
    setDisplayValue(0);
  }, []);

  const progress = Math.min((aqi / 500) * 100, 100);

  return (
    <div className={`glass-card-strong p-6 md:p-8 ${cat.glow} transition-all duration-700 hover-glow`}>
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <div className="relative flex-shrink-0">
          <div className={`w-36 h-36 md:w-44 md:h-44 rounded-full ${cat.bg} flex items-center justify-center border-4 border-current ${cat.color} animate-pulse-glow`}>
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">AQI</p>
              <p className={`text-5xl md:text-6xl font-extrabold font-mono ${cat.color} transition-colors duration-500`}>
                {displayValue}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <ShieldAlert className={`w-5 h-5 ${cat.color}`} />
            <span className={`text-lg font-bold ${cat.color}`}>{cat.label}</span>
            <div className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-aqi-good/10">
              <Radio className="w-3 h-3 text-aqi-good animate-pulse" />
              <span className="text-[10px] font-bold text-aqi-good uppercase tracking-wider blink">Live</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
            {aqi <= 50
              ? "Air quality is satisfactory, and air pollution poses little or no risk."
              : aqi <= 100
              ? "Air quality is acceptable. Some pollutants may be a concern for sensitive individuals."
              : aqi <= 200
              ? "Everyone may begin to experience health effects. Members of sensitive groups may experience more serious effects."
              : "Health warning of emergency conditions. The entire population is more likely to be affected."}
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>0</span><span>Good</span><span>Moderate</span><span>Poor</span><span>Severe</span><span>500</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-aqi-good via-aqi-moderate via-aqi-poor to-aqi-severe transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AQIOverview;
