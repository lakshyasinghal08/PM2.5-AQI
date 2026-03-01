import { useState, useMemo } from "react";
import { MapPin, Search, Navigation, ArrowRight } from "lucide-react";

const allCities = [
  "Delhi", "Mumbai", "Jaipur", "Bangalore", "Chennai",
  "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Lucknow",
  "Chandigarh", "Bhopal", "Indore", "Surat", "Patna",
];

interface CitySelectionScreenProps {
  username: string;
  onCitySelect: (city: string) => void;
}

const CitySelectionScreen = ({ username, onCitySelect }: CitySelectionScreenProps) => {
  const [selectedCity, setSelectedCity] = useState("");
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const filtered = useMemo(
    () => allCities.filter((c) => c.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const handleDetectLocation = () => {
    setDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Simple lat/lon → city mapping for demo
          const { latitude } = pos.coords;
          let city = "Delhi";
          if (latitude < 15) city = "Bangalore";
          else if (latitude < 20) city = "Mumbai";
          else if (latitude < 24) city = "Hyderabad";
          else if (latitude < 27) city = "Jaipur";
          else if (latitude < 29) city = "Lucknow";
          setSelectedCity(city);
          setSearch(city);
          setDetecting(false);
        },
        () => {
          setSelectedCity("Delhi");
          setSearch("Delhi");
          setDetecting(false);
        },
        { timeout: 5000 }
      );
    } else {
      setSelectedCity("Delhi");
      setSearch("Delhi");
      setDetecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 animated-gradient opacity-30" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-aqi-good/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 w-full max-w-md px-4 animate-fade-in">
        <div className="glass-card-strong p-8 space-y-6 glow-primary">
          {/* Welcome */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto glow-primary">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Welcome, {username}!</h1>
            <p className="text-sm text-muted-foreground">Select your city to view air quality data</p>
          </div>

          {/* Searchable Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select Your City</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setDropdownOpen(true); setSelectedCity(""); }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Search city..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-card border border-border/50 bg-secondary/30 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              {dropdownOpen && filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl glass-card-strong border border-border/50 shadow-xl z-50 animate-fade-in">
                  {filtered.map((city) => (
                    <button
                      key={city}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors flex items-center gap-2 ${
                        selectedCity === city ? "text-primary font-semibold bg-primary/5" : "text-foreground"
                      }`}
                      onClick={() => { setSelectedCity(city); setSearch(city); setDropdownOpen(false); }}
                    >
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detect Location */}
          <button
            onClick={handleDetectLocation}
            disabled={detecting}
            className="w-full py-2.5 rounded-xl glass-card border border-border/50 text-foreground font-medium text-sm hover:bg-primary/10 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Navigation className={`w-4 h-4 text-primary ${detecting ? "animate-spin" : ""}`} />
            {detecting ? "Detecting..." : "Use My Current Location"}
          </button>

          {/* Continue */}
          <button
            onClick={() => selectedCity && onCitySelect(selectedCity)}
            disabled={!selectedCity}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2 glow-primary hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitySelectionScreen;
