import { useState } from "react";

interface TimeToggleProps {
  onRangeChange: (range: string) => void;
}

const ranges = ["Today", "Yesterday", "Last 7 Days"];

const TimeToggle = ({ onRangeChange }: TimeToggleProps) => {
  const [active, setActive] = useState("Today");

  const handleClick = (range: string) => {
    setActive(range);
    onRangeChange(range);
  };

  return (
    <div className="flex gap-2">
      {ranges.map((r) => (
        <button
          key={r}
          onClick={() => handleClick(r)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 ${
            active === r
              ? "bg-primary text-primary-foreground glow-primary"
              : "glass-card text-muted-foreground hover:bg-primary/10"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
};

export default TimeToggle;
