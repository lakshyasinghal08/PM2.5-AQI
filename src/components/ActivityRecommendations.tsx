import { PersonStanding, Footprints, Dumbbell, Home, ShieldAlert } from "lucide-react";

interface ActivityRecommendationsProps {
  aqi: number;
}

const ActivityRecommendations = ({ aqi }: ActivityRecommendationsProps) => {
  const activities = aqi < 100
    ? [
        { icon: PersonStanding, label: "Running", status: "Safe", ok: true },
        { icon: Footprints, label: "Walking", status: "Safe", ok: true },
        { icon: Dumbbell, label: "Outdoor Sports", status: "Safe", ok: true },
      ]
    : aqi <= 200
    ? [
        { icon: PersonStanding, label: "Running", status: "Avoid", ok: false },
        { icon: Footprints, label: "Walking", status: "Limited", ok: null },
        { icon: Dumbbell, label: "Outdoor Sports", status: "Avoid", ok: false },
      ]
    : [
        { icon: Home, label: "Stay Indoors", status: "Required", ok: false },
        { icon: ShieldAlert, label: "Use N95 Mask", status: "Required", ok: false },
        { icon: Dumbbell, label: "Outdoor Exercise", status: "Avoid", ok: false },
      ];

  return (
    <div className="glass-card-strong p-6 space-y-3 hover-glow">
      <h2 className="text-sm font-semibold text-foreground">Can I go outside today?</h2>
      <div className="space-y-2">
        {activities.map((a) => (
          <div key={a.label} className="flex items-center gap-3 p-2.5 rounded-xl glass-card">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.ok === true ? "bg-aqi-good/15" : a.ok === null ? "bg-aqi-moderate/15" : "bg-aqi-severe/15"}`}>
              <a.icon className={`w-4 h-4 ${a.ok === true ? "text-aqi-good" : a.ok === null ? "text-aqi-moderate" : "text-aqi-severe"}`} />
            </div>
            <span className="text-sm text-foreground flex-1">{a.label}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.ok === true ? "bg-aqi-good/15 text-aqi-good" : a.ok === null ? "bg-aqi-moderate/15 text-aqi-moderate" : "bg-aqi-severe/15 text-aqi-severe"}`}>
              {a.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityRecommendations;
