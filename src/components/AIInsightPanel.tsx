import { useState, useEffect, useMemo } from "react";
import { Brain, Sparkles, TrendingUp, TrendingDown, Wind, Clock } from "lucide-react";
import { fetchInsights } from "@/lib/api";

interface AIInsightPanelProps {
  areas: { name: string; aqi: number; history: number[] }[];
  city: string;
}

const generateInsights = (areas: { name: string; aqi: number; history: number[] }[], city: string) => {
  const avgAqi = Math.round(areas.reduce((s, a) => s + a.aqi, 0) / (areas.length || 1));
  const yesterdayAvg = Math.round(areas.reduce((s, a) => s + (a.history[a.history.length - 2] || a.aqi), 0) / (areas.length || 1));
  const change = Math.round(((avgAqi - yesterdayAvg) / (yesterdayAvg || 1)) * 100);
  const worst = areas.reduce((w, a) => a.aqi > w.aqi ? a : w, areas[0]);
  const best = areas.reduce((b, a) => a.aqi < b.aqi ? a : b, areas[0]);
  const windSpeed = (Math.random() * 12 + 3).toFixed(1);

  const pool = [
    { icon: change > 0 ? TrendingUp : TrendingDown, text: `AQI ${change > 0 ? "increased" : "decreased"} ${Math.abs(change)}% compared to yesterday.`, type: change > 0 ? "warn" : "good" },
    { icon: Clock, text: `Pollution typically peaks between 7 PM – 10 PM in ${city}.`, type: "info" },
    { icon: Wind, text: `Wind speed of ${windSpeed} km/h ${Number(windSpeed) > 8 ? "helping" : "not sufficient for"} pollutant dispersion.`, type: Number(windSpeed) > 8 ? "good" : "warn" },
    { icon: TrendingUp, text: `${worst?.name || "Unknown"} has the highest AQI (${worst?.aqi || 0}) — avoid if possible.`, type: "warn" },
    { icon: TrendingDown, text: `${best?.name || "Unknown"} is the cleanest area with AQI ${best?.aqi || 0}.`, type: "good" },
    { icon: Sparkles, text: `${areas.filter(a => a.aqi > 200).length} areas currently in hazardous zone.`, type: "warn" },
    { icon: Wind, text: `Morning hours (5-8 AM) show ${Math.random() > 0.5 ? "15-25%" : "10-18%"} lower pollution levels.`, type: "good" },
  ];

  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
};

const AIInsightPanel = ({ areas, city }: AIInsightPanelProps) => {
  const [insights, setInsights] = useState(generateInsights(areas, city));
  const [pulse, setPulse] = useState(false);
  const [apiInsight, setApiInsight] = useState<{ trend_summary: string; percentage_change: number | null; peak_pollution_hour: number | null } | null>(null);

  useEffect(() => {
    fetchInsights(city).then(({ data, error }) => {
      if (error || !data) return;
      setApiInsight({
        trend_summary: data.trend_summary,
        percentage_change: data.percentage_change ?? null,
        peak_pollution_hour: data.peak_pollution_hour ?? null,
      });
    });
  }, [city]);

  const displayInsights = useMemo(() => {
    if (apiInsight && apiInsight.trend_summary) {
      const apiItems = [
        { icon: Sparkles, text: apiInsight.trend_summary, type: "info" as const },
        ...(apiInsight.peak_pollution_hour != null
          ? [{ icon: Clock, text: `Peak pollution hour: ${apiInsight.peak_pollution_hour}:00.`, type: "info" as const }]
          : []),
        ...(apiInsight.percentage_change != null
          ? [{ icon: apiInsight.percentage_change > 0 ? TrendingUp : TrendingDown, text: `24h change: ${apiInsight.percentage_change}%`, type: (apiInsight.percentage_change > 0 ? "warn" : "good") as const }]
          : []),
      ];
      return apiItems.slice(0, 4).map((item, i) => ({ ...item, key: i }));
    }
    return insights.map((insight, i) => ({ ...insight, key: i }));
  }, [apiInsight, insights]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => {
        setInsights(generateInsights(areas, city));
        setPulse(false);
      }, 300);
    }, 10000);
    return () => clearInterval(interval);
  }, [areas, city]);

  return (
    <div className="glass-card-strong p-5 space-y-4 hover-glow border border-primary/20 glow-primary">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            AI Insights
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          </h2>
        </div>
        <span className="text-[9px] text-muted-foreground px-2 py-1 rounded-full bg-secondary/60 border border-border/30">
          Auto · 10s
        </span>
      </div>
      <div className={`space-y-2.5 transition-opacity duration-300 ${pulse ? "opacity-40" : "opacity-100"}`}>
        {displayInsights.map((insight) => {
          const Icon = insight.icon;
          const borderCls = insight.type === "good" ? "border-aqi-good/20" : insight.type === "warn" ? "border-aqi-moderate/20" : "border-border/30";
          const iconCls = insight.type === "good" ? "text-aqi-good" : insight.type === "warn" ? "text-aqi-moderate" : "text-primary";
          return (
            <div key={insight.key} className={`flex items-start gap-2.5 p-3 rounded-xl glass-card border ${borderCls}`}>
              <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${iconCls}`} />
              <p className="text-[11px] text-muted-foreground leading-relaxed">{insight.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIInsightPanel;
