import { useMemo } from "react";
import { Sun, Clock, Shield } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface SafeOutdoorTimePredictorProps {
  aqi: number;
  prediction24h: { hour: string; aqi: number }[];
}

const SafeOutdoorTimePredictor = ({ aqi, prediction24h }: SafeOutdoorTimePredictorProps) => {
  const analysis = useMemo(() => {
    if (prediction24h.length === 0) return null;
    let bestStart = 0;
    let bestEnd = 0;
    let bestAvg = 999;
    for (let i = 0; i < prediction24h.length - 1; i++) {
      for (let j = i + 1; j <= Math.min(i + 4, prediction24h.length - 1); j++) {
        const slice = prediction24h.slice(i, j + 1);
        const avg = slice.reduce((s, d) => s + d.aqi, 0) / slice.length;
        if (avg < bestAvg) { bestAvg = avg; bestStart = i; bestEnd = j; }
      }
    }
    const startHour = (6 + bestStart) % 24;
    const endHour = (6 + bestEnd + 1) % 24;
    const fmt = (h: number) => `${h % 12 || 12}:00 ${h < 12 ? "AM" : "PM"}`;
    const safety = bestAvg <= 50 ? "Safe" : bestAvg <= 100 ? "Moderate" : "Unsafe";
    const safetyColor = bestAvg <= 50 ? "text-aqi-good" : bestAvg <= 100 ? "text-aqi-moderate" : "text-aqi-severe";
    const safetyBg = bestAvg <= 50 ? "bg-aqi-good/15" : bestAvg <= 100 ? "bg-aqi-moderate/15" : "bg-aqi-severe/15";
    return { timeRange: `${fmt(startHour)} – ${fmt(endHour)}`, safety, safetyColor, safetyBg, bestAvg: Math.round(bestAvg) };
  }, [prediction24h]);

  if (!analysis) return null;

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Sun className="w-4 h-4 text-aqi-moderate" />
        Safe Outdoor Time Predictor
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-primary" />
        <p className="text-xs text-muted-foreground">
          Best window: <span className="text-foreground font-bold">{analysis.timeRange}</span>
        </p>
      </div>
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${analysis.safetyBg} ${analysis.safetyColor}`}>
        <Shield className="w-3 h-3" />
        {analysis.safety} · Avg AQI {analysis.bestAvg}
      </div>
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={prediction24h}>
            <defs>
              <linearGradient id="safeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={5} />
            <YAxis tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={25} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 10 }} />
            <Area type="monotone" dataKey="aqi" stroke="hsl(var(--primary))" fill="url(#safeGrad)" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SafeOutdoorTimePredictor;
