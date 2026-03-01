import { Snowflake, Flower2, Sun, Leaf, Info } from "lucide-react";

const seasons = [
  { name: "Winter", icon: Snowflake, aqi: 210, color: "text-aqi-severe", bg: "bg-aqi-severe/10" },
  { name: "Spring", icon: Flower2, aqi: 95, color: "text-aqi-moderate", bg: "bg-aqi-moderate/10" },
  { name: "Summer", icon: Sun, aqi: 130, color: "text-aqi-poor", bg: "bg-aqi-poor/10" },
  { name: "Fall", icon: Leaf, aqi: 160, color: "text-aqi-poor", bg: "bg-aqi-poor/10" },
];

const SeasonalInsights = () => {
  return (
    <div className="space-y-4">
      <h2 className="section-title text-foreground">Seasonal AQI Insights</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {seasons.map((s) => (
          <div key={s.name} className="glass-card-strong p-5 text-center space-y-3 hover:scale-105 transition-all duration-300">
            <s.icon className={`w-8 h-8 mx-auto ${s.color}`} />
            <p className="text-sm font-semibold text-foreground">{s.name}</p>
            <div className={`inline-block px-3 py-1 rounded-lg ${s.bg}`}>
              <span className={`text-lg font-bold font-mono ${s.color}`}>{s.aqi}</span>
              <span className="text-[10px] text-muted-foreground ml-1">AQI</span>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Winter months show the highest AQI due to crop burning, thermal inversions, and increased domestic heating. 
          Spring offers the best air quality as wind patterns disperse pollutants naturally. 
          Summer sees moderate pollution from dust storms and vehicular traffic, while fall marks the beginning of rising pollution levels.
        </p>
      </div>
    </div>
  );
};

export default SeasonalInsights;
