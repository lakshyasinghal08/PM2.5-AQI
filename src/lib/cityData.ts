// Mock city data for AQI simulation
export interface CityData {
  name: string;
  aqi: number;
  pm25: number;
  co2: number;
  humidity: number;
  temp: number;
  weather: string;
  history7: number[];
  history30: number[];
}

const cityDatasets: Record<string, CityData> = {
  Delhi: {
    name: "Delhi", aqi: 215, pm25: 120, co2: 680, humidity: 58, temp: 34, weather: "Hazy",
    history7: [198, 210, 225, 190, 240, 205, 215],
    history30: [180, 195, 210, 200, 175, 190, 220, 230, 215, 195, 205, 225, 240, 210, 198, 185, 200, 215, 230, 220, 205, 195, 210, 225, 235, 215, 200, 190, 210, 215],
  },
  Mumbai: {
    name: "Mumbai", aqi: 95, pm25: 42, co2: 420, humidity: 78, temp: 30, weather: "Cloudy",
    history7: [88, 92, 105, 85, 98, 90, 95],
    history30: [80, 85, 90, 95, 88, 92, 100, 105, 98, 90, 85, 88, 92, 95, 100, 102, 96, 90, 88, 85, 92, 95, 98, 100, 96, 90, 88, 92, 95, 95],
  },
  Jaipur: {
    name: "Jaipur", aqi: 145, pm25: 72, co2: 520, humidity: 42, temp: 38, weather: "Sunny",
    history7: [130, 140, 155, 138, 160, 148, 145],
    history30: [120, 130, 140, 135, 125, 138, 150, 155, 145, 135, 140, 148, 155, 145, 138, 130, 140, 148, 155, 150, 142, 135, 145, 150, 155, 148, 140, 135, 142, 145],
  },
  Bangalore: {
    name: "Bangalore", aqi: 42, pm25: 18, co2: 350, humidity: 65, temp: 26, weather: "Pleasant",
    history7: [38, 45, 40, 35, 48, 42, 42],
    history30: [35, 38, 42, 40, 36, 38, 44, 48, 42, 38, 40, 42, 45, 40, 38, 35, 40, 42, 45, 44, 40, 38, 42, 44, 48, 42, 40, 38, 40, 42],
  },
  Chennai: {
    name: "Chennai", aqi: 78, pm25: 35, co2: 400, humidity: 82, temp: 32, weather: "Humid",
    history7: [72, 80, 85, 70, 78, 75, 78],
    history30: [65, 70, 75, 80, 72, 78, 82, 85, 78, 72, 70, 75, 80, 78, 72, 68, 74, 78, 82, 80, 75, 72, 76, 80, 85, 78, 74, 70, 75, 78],
  },
  Kolkata: {
    name: "Kolkata", aqi: 165, pm25: 85, co2: 560, humidity: 75, temp: 33, weather: "Overcast",
    history7: [155, 162, 170, 148, 175, 160, 165],
    history30: [140, 150, 160, 155, 145, 155, 168, 175, 165, 152, 158, 165, 172, 160, 155, 148, 158, 165, 170, 168, 160, 152, 160, 168, 175, 165, 155, 150, 158, 165],
  },
  Hyderabad: {
    name: "Hyderabad", aqi: 88, pm25: 40, co2: 410, humidity: 60, temp: 31, weather: "Partly Cloudy",
    history7: [82, 90, 95, 78, 88, 85, 88],
    history30: [75, 80, 85, 90, 82, 88, 92, 95, 88, 82, 80, 85, 90, 88, 82, 78, 84, 88, 92, 90, 85, 80, 86, 90, 95, 88, 84, 80, 85, 88],
  },
  Pune: {
    name: "Pune", aqi: 62, pm25: 28, co2: 380, humidity: 55, temp: 28, weather: "Pleasant",
    history7: [58, 65, 68, 55, 62, 60, 62],
    history30: [50, 55, 60, 65, 58, 62, 68, 70, 65, 58, 55, 60, 65, 62, 58, 52, 58, 62, 68, 65, 60, 55, 60, 65, 70, 65, 58, 55, 60, 62],
  },
  Ahmedabad: {
    name: "Ahmedabad", aqi: 130, pm25: 65, co2: 500, humidity: 45, temp: 36, weather: "Hot",
    history7: [120, 128, 135, 118, 138, 125, 130],
    history30: [110, 118, 125, 130, 120, 128, 135, 140, 132, 122, 125, 130, 138, 130, 125, 118, 125, 130, 138, 135, 128, 120, 128, 135, 140, 132, 125, 120, 128, 130],
  },
  Lucknow: {
    name: "Lucknow", aqi: 185, pm25: 95, co2: 600, humidity: 62, temp: 35, weather: "Hazy",
    history7: [175, 182, 190, 168, 195, 180, 185],
    history30: [160, 170, 180, 175, 165, 175, 188, 195, 185, 172, 178, 185, 192, 180, 175, 168, 178, 185, 192, 188, 180, 172, 180, 188, 195, 185, 175, 170, 178, 185],
  },
  Chandigarh: {
    name: "Chandigarh", aqi: 55, pm25: 22, co2: 360, humidity: 50, temp: 29, weather: "Clear",
    history7: [48, 55, 58, 45, 58, 52, 55],
    history30: [42, 48, 52, 55, 48, 52, 58, 60, 55, 48, 50, 55, 58, 55, 50, 45, 50, 55, 58, 56, 52, 48, 52, 56, 60, 55, 50, 48, 52, 55],
  },
  Bhopal: {
    name: "Bhopal", aqi: 110, pm25: 55, co2: 470, humidity: 52, temp: 33, weather: "Warm",
    history7: [102, 108, 115, 98, 118, 108, 110],
    history30: [95, 100, 108, 112, 102, 108, 115, 120, 112, 105, 108, 112, 118, 110, 105, 98, 105, 110, 118, 115, 108, 102, 108, 115, 120, 112, 105, 100, 108, 110],
  },
  Indore: {
    name: "Indore", aqi: 72, pm25: 32, co2: 390, humidity: 48, temp: 30, weather: "Clear",
    history7: [65, 72, 78, 62, 75, 70, 72],
    history30: [58, 65, 70, 75, 65, 70, 78, 80, 74, 68, 70, 74, 78, 72, 68, 62, 68, 72, 78, 75, 70, 65, 70, 75, 80, 74, 68, 65, 70, 72],
  },
  Surat: {
    name: "Surat", aqi: 98, pm25: 45, co2: 430, humidity: 70, temp: 32, weather: "Humid",
    history7: [90, 95, 102, 88, 100, 95, 98],
    history30: [82, 88, 92, 98, 90, 95, 100, 105, 98, 90, 88, 92, 98, 95, 90, 85, 90, 95, 102, 98, 92, 88, 92, 98, 105, 98, 92, 88, 92, 98],
  },
  Patna: {
    name: "Patna", aqi: 195, pm25: 100, co2: 620, humidity: 68, temp: 34, weather: "Hazy",
    history7: [185, 192, 200, 178, 205, 190, 195],
    history30: [170, 180, 190, 185, 175, 185, 198, 205, 195, 182, 188, 195, 202, 190, 185, 178, 188, 195, 202, 198, 190, 182, 190, 198, 205, 195, 185, 180, 188, 195],
  },
};

export const getCityData = (city: string): CityData => {
  return cityDatasets[city] || cityDatasets.Delhi;
};

export const cities = Object.keys(cityDatasets);

export const getAqiCategory = (aqi: number) => {
  if (aqi <= 50) return { label: "Good", color: "text-aqi-good", bg: "bg-aqi-good/10", glow: "glow-green" };
  if (aqi <= 100) return { label: "Moderate", color: "text-aqi-moderate", bg: "bg-aqi-moderate/10", glow: "glow-yellow" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive", color: "text-aqi-poor", bg: "bg-aqi-poor/10", glow: "glow-orange" };
  if (aqi <= 200) return { label: "Unhealthy", color: "text-aqi-severe", bg: "bg-aqi-severe/10", glow: "glow-red" };
  return { label: "Very Unhealthy", color: "text-aqi-danger", bg: "bg-aqi-danger/10", glow: "glow-purple" };
};

export const getAqiInsight = (aqi: number) => {
  if (aqi <= 50) return "Air quality is excellent. All outdoor activities are safe. Enjoy the fresh air!";
  if (aqi <= 100) return "Air quality is acceptable. Sensitive individuals should consider reducing prolonged outdoor exertion.";
  if (aqi <= 150) return "Members of sensitive groups may experience health effects. The general public is less likely to be affected.";
  if (aqi <= 200) return "Everyone may begin to experience health effects. Limit prolonged outdoor exertion and use N95 masks.";
  return "Health alert: everyone may experience serious health effects. Stay indoors and run air purifiers at maximum.";
};
