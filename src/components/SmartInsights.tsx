import { Brain, Sparkles } from "lucide-react";
import { getAqiInsight } from "@/lib/cityData";

interface SmartInsightsProps {
  aqi: number;
}

const SmartInsights = ({ aqi }: SmartInsightsProps) => {
  return (
    <div className="glass-card-strong p-6 space-y-3 hover-glow border border-primary/20 glow-primary">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          AI Recommendation
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
        </h2>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed italic">
        "{getAqiInsight(aqi)}"
      </p>
    </div>
  );
};

export default SmartInsights;
