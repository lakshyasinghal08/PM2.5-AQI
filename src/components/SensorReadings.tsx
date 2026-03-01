import { useState, useEffect } from "react";

const baseSensors = [
  { name: "PM10", base: 120, unit: "µg/m³", color: "aqi-poor", glow: "glow-orange" },
  { name: "PM2.5", base: 85, unit: "µg/m³", color: "aqi-poor", glow: "glow-orange" },
  { name: "CO₂", base: 620, unit: "ppm", color: "aqi-moderate", glow: "glow-yellow" },
  { name: "Temp", base: 28, unit: "°C", color: "aqi-good", glow: "glow-green" },
  { name: "Humidity", base: 62, unit: "%", color: "aqi-good", glow: "glow-green" },
  { name: "NO₂", base: 45, unit: "ppb", color: "aqi-moderate", glow: "glow-yellow" },
  { name: "O₂", base: 20.9, unit: "%", color: "aqi-good", glow: "glow-green" },
];

const SensorReadings = () => {
  const [values, setValues] = useState(baseSensors.map((s) => s.base));

  useEffect(() => {
    const interval = setInterval(() => {
      setValues((prev) =>
        prev.map((v, i) => {
          const delta = (Math.random() - 0.5) * baseSensors[i].base * 0.05;
          return Math.round((v + delta) * 10) / 10;
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="section-title text-foreground">Sensor Readings</h2>
      {/* Top row: 5 sensors - M peaks */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 justify-items-center">
        {baseSensors.slice(0, 5).map((s, i) => (
          <SensorCircle key={i} sensor={s} value={values[i]} delay={i * 100} />
        ))}
      </div>
      {/* Bottom row: 2 sensors centered - M valley */}
      <div className="flex justify-center gap-4 md:gap-6">
        <div className="hidden md:block w-28 md:w-32" />
        {baseSensors.slice(5).map((s, i) => (
          <SensorCircle key={i + 5} sensor={s} value={values[i + 5]} delay={(i + 5) * 100} />
        ))}
        <div className="hidden md:block w-28 md:w-32" />
      </div>
    </div>
  );
};

const SensorCircle = ({
  sensor,
  value,
  delay,
}: {
  sensor: (typeof baseSensors)[0];
  value: number;
  delay: number;
}) => {
  return (
    <div
      className={`w-28 h-28 md:w-32 md:h-32 rounded-full glass-card border-2 border-${sensor.color}/40 ${sensor.glow} flex flex-col items-center justify-center hover:scale-110 transition-all duration-500 cursor-default animate-float sensor-pulse`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {sensor.name}
      </span>
      <span className={`text-2xl md:text-3xl font-bold font-mono text-${sensor.color} transition-all duration-700`}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground">{sensor.unit}</span>
    </div>
  );
};

export default SensorReadings;
