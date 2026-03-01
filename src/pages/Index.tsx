import { useState, useEffect } from "react";
import LoginScreen from "@/components/LoginScreen";
import CitySelectionScreen from "@/components/CitySelectionScreen";
import DashboardHeader from "@/components/DashboardHeader";
import LocationBar from "@/components/LocationBar";
import AQIOverview from "@/components/AQIOverview";
import AQIAlert from "@/components/AQIAlert";
import PollutantMShape from "@/components/PollutantMShape";
import AQIPrediction from "@/components/AQIPrediction";
import DominantPollutant from "@/components/DominantPollutant";
import ActivityRecommendations from "@/components/ActivityRecommendations";
import SmartInsights from "@/components/SmartInsights";
import AQITrend from "@/components/AQITrend";
import JaipurAreaMap from "@/components/JaipurAreaMap";
import type { AreaData } from "@/components/JaipurAreaMap";
import AIInsightPanel from "@/components/AIInsightPanel";
import CleanAreaRanking from "@/components/CleanAreaRanking";
import DownloadReport from "@/components/DownloadReport";
import AboutAQI from "@/components/AboutAQI";
import { getCityData } from "@/lib/cityData";
import { fetchAqi, CITY_COORDINATES } from "@/lib/api";

const Index = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [cityData, setCityData] = useState(getCityData("Delhi"));
  const [mapAreas, setMapAreas] = useState<AreaData[]>([]);

  useEffect(() => {
    if (!city) return;
    const base = getCityData(city);
    setCityData(base);
    const coords = CITY_COORDINATES[city];
    if (coords) {
      fetchAqi(coords.lat, coords.lon).then(({ data, error }) => {
        if (error) console.warn("[Index] AQI fetch failed, using mock data:", error);
        if (data) {
          setCityData((prev) => ({
            ...prev,
            aqi: data.aqi,
            pm25: data.pollutants.pm25,
          }));
        }
      });
    }
    const interval = setInterval(() => {
      setCityData((prev) => {
        const delta = Math.floor((Math.random() - 0.5) * 16);
        const newAqi = Math.max(0, Math.min(500, prev.aqi + delta));
        return {
          ...prev,
          aqi: newAqi,
          pm25: Math.max(5, prev.pm25 + Math.floor((Math.random() - 0.5) * 6)),
          co2: Math.max(300, prev.co2 + Math.floor((Math.random() - 0.5) * 10)),
          humidity: Math.max(20, Math.min(95, prev.humidity + Math.floor((Math.random() - 0.5) * 4))),
        };
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [city]);

  if (!username) {
    return <LoginScreen onLogin={(name) => setUsername(name)} />;
  }

  if (!city) {
    return <CitySelectionScreen username={username} onCitySelect={(c) => setCity(c)} />;
  }

  const getBgTint = (aqi: number) => {
    if (aqi <= 50) return "from-aqi-good/5 to-transparent";
    if (aqi <= 100) return "from-aqi-moderate/5 to-transparent";
    if (aqi <= 200) return "from-aqi-poor/5 to-transparent";
    return "from-aqi-severe/5 to-transparent";
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden animate-fade-in">
      <div className={`fixed inset-0 bg-gradient-to-br ${getBgTint(cityData.aqi)} transition-all duration-1000 pointer-events-none`} />
      <div className="fixed inset-0 animated-gradient opacity-10 pointer-events-none" />

      <DashboardHeader username={username} onLogout={() => { setUsername(null); setCity(null); }} city={city} onCityChange={setCity} />

      <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <LocationBar city={city} weather={cityData.weather} temp={cityData.temp} onCityChange={setCity} />

        <AQIAlert aqi={cityData.aqi} />

        <AQIOverview aqi={cityData.aqi} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AQIPrediction aqi={cityData.aqi} temperature={cityData.temp} humidity={cityData.humidity} />
          <DominantPollutant pm25={cityData.pm25} co2={cityData.co2} aqi={cityData.aqi} />
        </div>

        <PollutantMShape aqi={cityData.aqi} pm25={cityData.pm25} co2={cityData.co2} humidity={cityData.humidity} temp={cityData.temp} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActivityRecommendations aqi={cityData.aqi} />
          <SmartInsights aqi={cityData.aqi} />
        </div>

        <AQITrend history7={cityData.history7} history30={cityData.history30} />

        <JaipurAreaMap city={city} onAreasUpdate={setMapAreas} />

        {/* AI Insights */}
        {mapAreas.length > 0 && (
          <AIInsightPanel areas={mapAreas} city={city} />
        )}

        {/* Clean Area Ranking */}
        {mapAreas.length > 0 && (
          <CleanAreaRanking areas={mapAreas} city={city} />
        )}

        <div className="flex items-center justify-center">
          <DownloadReport city={city} aqi={cityData.aqi} pm25={cityData.pm25} co2={cityData.co2} humidity={cityData.humidity} history7={cityData.history7} />
        </div>

        <AboutAQI />

        <div className="py-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            PM2.5 Dashboard — Real-time Environmental Intelligence
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
