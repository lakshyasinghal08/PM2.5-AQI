import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

const generateTimeData = () => {
  const hours = [];
  for (let i = 23; i >= 0; i--) {
    const h = new Date();
    h.setHours(h.getHours() - i);
    hours.push({
      time: `${h.getHours().toString().padStart(2, "0")}:00`,
      aqi: Math.floor(120 + Math.random() * 100),
    });
  }
  return hours;
};

const pollutantData = [
  { name: "PM2.5", value: 85, fill: "hsl(var(--aqi-poor))" },
  { name: "PM10", value: 120, fill: "hsl(var(--aqi-poor))" },
  { name: "NO₂", value: 45, fill: "hsl(var(--aqi-moderate))" },
  { name: "CO₂", value: 62, fill: "hsl(var(--aqi-moderate))" },
  { name: "O₂", value: 20.9, fill: "hsl(var(--aqi-good))" },
];

const AQICharts = () => {
  const [timeData, setTimeData] = useState(generateTimeData);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeData((prev) => {
        const updated = [...prev.slice(1)];
        const h = new Date();
        updated.push({
          time: `${h.getHours().toString().padStart(2, "0")}:${h.getMinutes().toString().padStart(2, "0")}`,
          aqi: Math.floor(120 + Math.random() * 100),
        });
        return updated;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const tooltipStyle = {
    backgroundColor: "hsl(222, 25%, 12%)",
    border: "1px solid hsl(222, 20%, 18%)",
    borderRadius: "12px",
    color: "hsl(210, 20%, 92%)",
    fontSize: "12px",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* AQI Over Time */}
      <div className="glass-card-strong p-6 space-y-4 hover-glow">
        <h2 className="section-title text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          AQI Trend (24h)
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeData}>
              <defs>
                <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 18%)" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="aqi"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#aqiGradient)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pollutant Comparison */}
      <div className="glass-card-strong p-6 space-y-4 hover-glow">
        <h2 className="section-title text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Pollutant Levels
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pollutantData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 18%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={1500}>
                {pollutantData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Need Cell import
import { Cell } from "recharts";

export default AQICharts;
