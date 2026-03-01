import { useState, useEffect, useRef } from "react";
import { Sun, Moon, Wind, User, Settings, LogOut, ChevronDown, MapPin } from "lucide-react";
import { cities } from "@/lib/cityData";

interface DashboardHeaderProps {
  username: string;
  onLogout: () => void;
  city?: string;
  onCityChange?: (city: string) => void;
}

const DashboardHeader = ({ username, onLogout, city, onCityChange }: DashboardHeaderProps) => {
  const [isDark, setIsDark] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="glass-card-strong sticky top-0 z-50 px-4 md:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
          <Wind className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-base md:text-lg font-bold tracking-tight text-foreground">
            PM2.5
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">Real-time environmental intelligence</p>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => setIsDark(!isDark)}
          className="w-9 h-9 rounded-xl glass-card flex items-center justify-center hover:bg-primary/10 transition-all duration-300"
        >
          {isDark ? <Sun className="w-4 h-4 text-aqi-moderate" /> : <Moon className="w-4 h-4 text-primary" />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card hover:bg-primary/10 transition-all duration-300"
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="hidden sm:inline text-sm font-medium text-foreground">Welcome, {username}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl glass-card-strong border border-border/50 shadow-xl z-50 animate-fade-in overflow-hidden">
              <div className="p-3 border-b border-border/30">
                <p className="text-sm font-semibold text-foreground">{username}</p>
              </div>
              <div className="py-1">
                {[
                  { icon: User, label: "Profile" },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
                {/* City Picker */}
                <div className="relative">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
                    onClick={() => setCityPickerOpen(!cityPickerOpen)}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    City: {city || "Delhi"}
                    <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${cityPickerOpen ? "rotate-180" : ""}`} />
                  </button>
                  {cityPickerOpen && (
                    <div className="border-t border-border/30 bg-secondary/30">
                      {cities.map((c) => (
                        <button
                          key={c}
                          className={`w-full text-left px-6 py-1.5 text-xs hover:bg-primary/10 transition-colors ${c === city ? "text-primary font-semibold" : "text-muted-foreground"}`}
                          onClick={() => { onCityChange?.(c); setCityPickerOpen(false); setDropdownOpen(false); }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-aqi-severe hover:bg-aqi-severe/10 transition-colors"
                  onClick={() => { setDropdownOpen(false); onLogout(); }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
