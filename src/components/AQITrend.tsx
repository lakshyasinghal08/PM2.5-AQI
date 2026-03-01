import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp } from "lucide-react";

interface AQITrendProps {
  history7: number[];
  history30: number[];
}

const AQITrend = ({ history7, history30 }: AQITrendProps) => {
  const [range, setRange] = useState<"7" | "30">("7");

  const data = (range === "7" ? history7 : history30).map((val, i) => ({
    day: `Day ${i + 1}`,
    AQI: val,
  }));

  const getColor = (val: number) => {
    if (val <= 50) return "hsl(var(--aqi-good))";
    if (val <= 100) return "hsl(var(--aqi-moderate))";
    if (val <= 150) return "hsl(var(--aqi-poor))";
    if (val <= 200) return "hsl(var(--aqi-severe))";
    return "hsl(var(--aqi-danger))";
  };

  const maxAqi = Math.max(...data.map(d => d.AQI));
  const gradientColor = getColor(maxAqi);

  return (
    <div className="glass-card-strong p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          AQI Trend
        </h2>
        <div className="flex gap-1 rounded-xl glass-card p-1">
          {(["7", "30"] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {r}D
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={gradientColor} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} interval={range === "30" ? 4 : 0} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 350]} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))", fontSize: "12px" }} />
            <ReferenceLine y={200} stroke="hsl(var(--aqi-severe))" strokeDasharray="4 4" label={{ value: "Severe", fill: "hsl(var(--aqi-severe))", fontSize: 10 }} />
            <ReferenceLine y={100} stroke="hsl(var(--aqi-moderate))" strokeDasharray="4 4" label={{ value: "Moderate", fill: "hsl(var(--aqi-moderate))", fontSize: 10 }} />
            <Area type="monotone" dataKey="AQI" stroke={gradientColor} strokeWidth={2} fill="url(#aqiGradient)"
              dot={{ r: 3, fill: gradientColor }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AQITrend;
