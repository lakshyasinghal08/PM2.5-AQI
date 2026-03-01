import { useMemo, useState, useEffect } from "react";
import { Award, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { fetchRanking } from "@/lib/api";
import { Progress } from "@/components/ui/progress";

interface AreaData {
  name: string;
  aqi: number;
  history: number[];
}

interface CleanAreaRankingProps {
  areas: AreaData[];
  city?: string;
}

const getAqiColor = (aqi: number) => {
  if (aqi <= 50) return { text: "text-aqi-good", bg: "bg-aqi-good", hex: "hsl(var(--aqi-good))" };
  if (aqi <= 100) return { text: "text-aqi-moderate", bg: "bg-aqi-moderate", hex: "hsl(var(--aqi-moderate))" };
  if (aqi <= 200) return { text: "text-aqi-poor", bg: "bg-aqi-poor", hex: "hsl(var(--aqi-poor))" };
  return { text: "text-aqi-severe", bg: "bg-aqi-severe", hex: "hsl(var(--aqi-severe))" };
};

const CleanAreaRanking = ({ areas, city }: CleanAreaRankingProps) => {
  const [apiRanking, setApiRanking] = useState<{
    top_clean_areas: Array<{ area: string; avg_aqi: number; clean_air_score: number }>;
    top_polluted_areas: Array<{ area: string; avg_aqi: number; clean_air_score: number }>;
  } | null>(null);

  useEffect(() => {
    if (!city) return;
    fetchRanking(city).then(({ data, error }) => {
      if (error || !data) return;
      setApiRanking({ top_clean_areas: data.top_clean_areas, top_polluted_areas: data.top_polluted_areas });
    });
  }, [city]);

  const ranked = useMemo(() => {
    return areas.map(a => {
      const avg7 = Math.round(a.history.reduce((s, v) => s + v, 0) / (a.history.length || 1));
      const cleanScore = Math.max(0, Math.round(100 - (a.aqi / 5)));
      const improvement = avg7 > 0 ? Math.round(((avg7 - a.aqi) / avg7) * 100) : 0;
      return { ...a, avg7, cleanScore, improvement };
    }).sort((a, b) => a.aqi - b.aqi);
  }, [areas]);

  const cleanest = ranked.slice(0, 5);
  const dirtiest = [...ranked].reverse().slice(0, 5);

  const ApiRankItem = ({ item, rank, type }: { item: { area: string; avg_aqi: number; clean_air_score: number }; rank: number; type: "clean" | "polluted" }) => {
    const color = getAqiColor(item.avg_aqi);
    return (
      <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl glass-card hover:bg-secondary/40 transition-colors">
        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${type === "clean" ? "bg-aqi-good/15 text-aqi-good" : "bg-aqi-severe/15 text-aqi-severe"}`}>#{rank}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-foreground truncate">{item.area}</span>
            <span className={`text-xs font-bold font-mono ${color.text}`}>{item.avg_aqi}</span>
          </div>
          <div className="relative h-1.5 rounded-full bg-secondary/60 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${color.bg}`} style={{ width: `${item.clean_air_score}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-muted-foreground">Clean score: {item.clean_air_score}</span>
          </div>
        </div>
      </div>
    );
  };

  const RankItem = ({ item, rank, type }: { item: typeof ranked[0]; rank: number; type: "clean" | "polluted" }) => {
    const color = getAqiColor(item.aqi);
    return (
      <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl glass-card hover:bg-secondary/40 transition-colors">
        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
          type === "clean" ? "bg-aqi-good/15 text-aqi-good" : "bg-aqi-severe/15 text-aqi-severe"
        }`}>#{rank}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-foreground truncate">{item.name}</span>
            <span className={`text-xs font-bold font-mono ${color.text}`}>{item.aqi}</span>
          </div>
          <div className="relative h-1.5 rounded-full bg-secondary/60 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${color.bg}`}
              style={{ width: `${item.cleanScore}%` }} />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[9px] text-muted-foreground">7d avg: {item.avg7}</span>
            <span className={`text-[9px] font-semibold flex items-center gap-0.5 ${item.improvement > 0 ? "text-aqi-good" : "text-aqi-severe"}`}>
              {item.improvement > 0 ? <TrendingDown className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5" />}
              {Math.abs(item.improvement)}%
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-muted-foreground">Score</p>
          <p className={`text-xs font-bold ${color.text}`}>{item.cleanScore}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card-strong p-5 space-y-4 hover-glow">
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Clean Area Ranking</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apiRanking && (apiRanking.top_clean_areas.length > 0 || apiRanking.top_polluted_areas.length > 0) ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2 h-2 rounded-full bg-aqi-good" />
                <span className="text-[11px] font-semibold text-foreground">Top Clean (API)</span>
              </div>
              {apiRanking.top_clean_areas.slice(0, 5).map((item, i) => <ApiRankItem key={item.area} item={item} rank={i + 1} type="clean" />)}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3 h-3 text-aqi-severe" />
                <span className="text-[11px] font-semibold text-foreground">Top Polluted (API)</span>
              </div>
              {apiRanking.top_polluted_areas.slice(0, 5).map((item, i) => <ApiRankItem key={item.area} item={item} rank={i + 1} type="polluted" />)}
            </div>
          </>
        ) : (
          <>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-aqi-good" />
            <span className="text-[11px] font-semibold text-foreground">Top 5 Cleanest</span>
          </div>
          {cleanest.map((item, i) => <RankItem key={item.name} item={item} rank={i + 1} type="clean" />)}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3 h-3 text-aqi-severe" />
            <span className="text-[11px] font-semibold text-foreground">Top 5 Most Polluted</span>
          </div>
          {dirtiest.map((item, i) => <RankItem key={item.name} item={item} rank={i + 1} type="polluted" />)}
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CleanAreaRanking;
