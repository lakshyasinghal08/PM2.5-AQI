import { BookOpen, Heart, Shield } from "lucide-react";

const cards = [
  {
    icon: BookOpen,
    title: "What is AQI?",
    text: "The Air Quality Index measures how polluted the air is on a scale of 0–500. It accounts for PM2.5, PM10, CO₂, NO₂, and O₃ concentrations.",
  },
  {
    icon: Heart,
    title: "Health Effects",
    text: "Poor air quality causes eye irritation, respiratory issues, and long-term risks like heart disease. Children and elderly are most vulnerable.",
  },
  {
    icon: Shield,
    title: "How to Stay Safe",
    text: "Use N95 masks outdoors, run air purifiers indoors, avoid peak traffic hours, and monitor AQI before outdoor activities.",
  },
];

const AboutAQI = () => {
  return (
    <div className="space-y-4">
      <h2 className="section-title text-foreground flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        About AQI
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.title} className="glass-card-strong p-5 space-y-3 hover-glow">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <c.icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutAQI;
