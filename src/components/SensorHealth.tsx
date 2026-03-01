import { Activity, Wifi } from "lucide-react";

const sensorList = [
  { name: "PM10 Sensor", status: "Online", active: true },
  { name: "PM2.5 Sensor", status: "Online", active: true },
  { name: "CO₂ Detector", status: "Online", active: true },
  { name: "Temperature Probe", status: "Online", active: true },
  { name: "Humidity Sensor", status: "Online", active: true },
  { name: "NO₂ Analyzer", status: "Online", active: true },
  { name: "O₂ Sensor", status: "Calibrating", active: false },
];

const SensorHealth = () => {
  const onlineCount = sensorList.filter((s) => s.active).length;

  return (
    <div className="glass-card-strong p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Sensor Health
        </h2>
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-aqi-good/10">
          <Wifi className="w-3.5 h-3.5 text-aqi-good" />
          <span className="text-xs font-semibold text-aqi-good">{onlineCount}/{sensorList.length} Online</span>
        </div>
      </div>

      <div className="space-y-2">
        {sensorList.map((sensor) => (
          <div
            key={sensor.name}
            className="flex items-center justify-between p-3 rounded-xl glass-card hover:bg-primary/5 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${sensor.active ? "bg-aqi-good animate-pulse" : "bg-aqi-moderate"}`} />
              <span className="text-sm font-medium text-foreground">{sensor.name}</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
              sensor.active ? "bg-aqi-good/10 text-aqi-good" : "bg-aqi-moderate/10 text-aqi-moderate"
            }`}>
              {sensor.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SensorHealth;
