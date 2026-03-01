import { useState, useMemo, useEffect } from "react";
import { Activity, User, Gauge } from "lucide-react";
import { fetchExposure } from "@/lib/api";

interface PollutionExposureCalculatorProps {
  aqi: number;
}

const activityMap = { low: "Low" as const, moderate: "Moderate" as const, high: "High" as const };
const ageMap = { child: "Child" as const, adult: "Adult" as const, elderly: "Elderly" as const };

const PollutionExposureCalculator = ({ aqi }: PollutionExposureCalculatorProps) => {
  const [hours, setHours] = useState(2);
  const [activityLevel, setActivityLevel] = useState<"low" | "moderate" | "high">("moderate");
  const [ageGroup, setAgeGroup] = useState<"child" | "adult" | "elderly">("adult");
  const [apiResult, setApiResult] = useState<{ score: number; level: string; advisory: string } | null>(null);

  useEffect(() => {
    fetchExposure({
      aqi,
      hours_outside: hours,
      activity_level: activityMap[activityLevel],
      age_group: ageMap[ageGroup],
    }).then(({ data, error }) => {
      if (error) {
        setApiResult(null);
        return;
      }
      if (data) setApiResult({ score: data.exposure_score, level: data.risk_level, advisory: data.advisory });
    });
  }, [aqi, hours, activityLevel, ageGroup]);

  const result = useMemo(() => {
    if (apiResult) return { ...apiResult, color: apiResult.level === "Low" ? "text-aqi-good" : apiResult.level === "Medium" ? "text-aqi-moderate" : "text-aqi-severe", bg: apiResult.level === "Low" ? "bg-aqi-good" : apiResult.level === "Medium" ? "bg-aqi-moderate" : "bg-aqi-severe" };
    const actMultiplier = activityLevel === "low" ? 0.6 : activityLevel === "moderate" ? 1.0 : 1.6;
    const ageMultiplier = ageGroup === "child" ? 1.4 : ageGroup === "adult" ? 1.0 : 1.5;
    const rawScore = (aqi / 500) * (hours / 8) * actMultiplier * ageMultiplier * 100;
    const score = Math.min(100, Math.round(rawScore));
    const level = score <= 30 ? "Low" : score <= 65 ? "Medium" : "High";
    const color = score <= 30 ? "text-aqi-good" : score <= 65 ? "text-aqi-moderate" : "text-aqi-severe";
    const bg = score <= 30 ? "bg-aqi-good" : score <= 65 ? "bg-aqi-moderate" : "bg-aqi-severe";
    const advisory = score <= 30
      ? "Your exposure is within safe limits. Continue normal activities."
      : score <= 65
      ? "Moderate risk. Consider reducing outdoor time or wearing a mask."
      : "High exposure risk! Stay indoors, use air purifiers, and wear N95 masks if going out.";
    return { score, level, color, bg, advisory };
  }, [aqi, hours, activityLevel, ageGroup, apiResult]);

  const btnCls = (active: boolean) =>
    `px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
      active ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary/60 text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Activity className="w-4 h-4 text-aqi-poor" />
        Pollution Exposure Calculator
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">Hours Outdoors: <span className="text-foreground font-bold">{hours}h</span></label>
          <input type="range" min={0.5} max={12} step={0.5} value={hours} onChange={e => setHours(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-secondary cursor-pointer accent-primary" />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground mb-1.5 block">Activity Level</label>
          <div className="flex gap-1.5">
            {(["low", "moderate", "high"] as const).map(l => (
              <button key={l} onClick={() => setActivityLevel(l)} className={btnCls(activityLevel === l)}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground mb-1.5 block">Age Group</label>
          <div className="flex gap-1.5">
            {(["child", "adult", "elderly"] as const).map(a => (
              <button key={a} onClick={() => setAgeGroup(a)} className={btnCls(ageGroup === a)}>
                <User className="w-2.5 h-2.5 inline mr-0.5" />
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Exposure Risk</span>
          <span className={`font-bold ${result.color}`}>{result.level} ({result.score}/100)</span>
        </div>
        <div className="w-full h-3 rounded-full bg-secondary/60 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700 ease-out" style={{
            width: `${result.score}%`,
            background: `linear-gradient(90deg, hsl(var(--aqi-good)), hsl(var(--aqi-moderate)), hsl(var(--aqi-severe)))`,
          }} />
        </div>
        <div className="flex justify-between text-[8px] text-muted-foreground">
          <span>Low</span><span>Medium</span><span>High</span>
        </div>
      </div>

      <div className="glass-card p-3 rounded-lg">
        <div className="flex items-start gap-2">
          <Gauge className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">{result.advisory}</p>
        </div>
      </div>
    </div>
  );
};

export default PollutionExposureCalculator;
