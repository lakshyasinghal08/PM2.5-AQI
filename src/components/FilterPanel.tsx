import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

const cities = ["New Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata"];
const pollutants = ["PM2.5", "PM10", "NO₂", "CO₂", "O₃"];

const FilterPanel = () => {
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("New Delhi");
  const [selectedPollutants, setSelectedPollutants] = useState(["PM2.5", "PM10"]);

  const togglePollutant = (p: string) => {
    setSelectedPollutants((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-xl glass-card-strong flex items-center justify-center hover:bg-primary/10 transition-all duration-300 glow-primary"
      >
        <SlidersHorizontal className="w-4 h-4 text-primary" />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setOpen(false)}>
          <div
            className="w-72 h-full glass-card-strong border-l border-border/50 p-6 space-y-6 animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Filters</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">City</label>
              <div className="relative">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-card bg-secondary/30 border border-border/50 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {cities.map((c) => (
                    <option key={c} value={c} className="bg-card text-foreground">{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 rounded-xl glass-card bg-secondary/30 border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Pollutants */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pollutants</label>
              <div className="flex flex-wrap gap-2">
                {pollutants.map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePollutant(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedPollutants.includes(p)
                        ? "bg-primary text-primary-foreground"
                        : "glass-card text-muted-foreground hover:bg-primary/10"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all glow-primary">
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterPanel;
