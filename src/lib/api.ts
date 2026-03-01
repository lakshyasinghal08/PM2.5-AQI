/**
 * Air Sense API client. All requests use VITE_API_URL and include
 * error handling and console logging for debugging.
 */

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    console.warn("[API] VITE_API_URL is not set, falling back to http://localhost:8000");
    return "http://localhost:8000";
  }
  return url.replace(/\/$/, "");
};

const baseUrl = getBaseUrl();

export interface AQIResponse {
  aqi: number;
  category: string;
  pollutants: { pm25: number; pm10: number; co: number; no2: number };
}

export interface PredictionRequest {
  current_aqi: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
}

export interface PredictionResponse {
  predicted_aqi: number;
  trend: string;
  confidence: string;
}

export interface ExposureRequest {
  aqi: number;
  hours_outside: number;
  activity_level: "Low" | "Moderate" | "High";
  age_group: "Child" | "Adult" | "Elderly";
}

export interface ExposureResponse {
  exposure_score: number;
  risk_level: "Low" | "Medium" | "High";
  advisory: string;
}

export interface InsightsResponse {
  percentage_change: number | null;
  peak_pollution_hour: number | null;
  trend_summary: string;
  record_count: number;
  city: string | null;
  first_aqi?: number;
  last_aqi?: number;
}

export interface RankingResponse {
  top_clean_areas: Array<{ area: string; avg_aqi: number; clean_air_score: number }>;
  top_polluted_areas: Array<{ area: string; avg_aqi: number; clean_air_score: number }>;
  city_filter: string | null;
}

async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  const url = `${baseUrl}${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    const data = (await res.json().catch(() => null)) as T;
    console.log("[API]", path, res.status, data);
    if (!res.ok) {
      const errMsg = typeof data === "object" && data !== null && "detail" in data
        ? JSON.stringify((data as { detail: unknown }).detail)
        : res.statusText;
      console.error("[API] Error", path, res.status, errMsg);
      return { data: null, error: errMsg };
    }
    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[API] Fetch failed", path, message);
    return { data: null, error: message };
  }
}

/** GET /aqi?lat=...&lon=... */
export async function fetchAqi(lat: number, lon: number): Promise<{ data: AQIResponse | null; error: string | null }> {
  return fetchApi<AQIResponse>(`/aqi?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);
}

/** Approximate lat/lon per city for API AQI fetch */
export const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  Delhi: { lat: 28.6139, lon: 77.209 },
  Mumbai: { lat: 19.076, lon: 72.8777 },
  Jaipur: { lat: 26.9124, lon: 75.7873 },
  Bangalore: { lat: 12.9716, lon: 77.5946 },
  Chennai: { lat: 13.0827, lon: 80.2707 },
  Kolkata: { lat: 22.5726, lon: 88.3639 },
  Hyderabad: { lat: 17.385, lon: 78.4867 },
  Pune: { lat: 18.5204, lon: 73.8567 },
  Ahmedabad: { lat: 23.0225, lon: 72.5714 },
  Lucknow: { lat: 26.8467, lon: 80.9462 },
  Chandigarh: { lat: 30.7333, lon: 76.7794 },
  Bhopal: { lat: 23.2599, lon: 77.4126 },
  Indore: { lat: 22.7196, lon: 75.8577 },
  Surat: { lat: 21.1702, lon: 72.8311 },
  Patna: { lat: 25.5941, lon: 85.1376 },
};

/** POST /predict */
export async function fetchPrediction(
  body: PredictionRequest
): Promise<{ data: PredictionResponse | null; error: string | null }> {
  return fetchApi<PredictionResponse>("/predict", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** POST /exposure */
export async function fetchExposure(
  body: ExposureRequest
): Promise<{ data: ExposureResponse | null; error: string | null }> {
  return fetchApi<ExposureResponse>("/exposure", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /insights?city=... */
export async function fetchInsights(
  city?: string
): Promise<{ data: InsightsResponse | null; error: string | null }> {
  const path = city ? `/insights?city=${encodeURIComponent(city)}` : "/insights";
  return fetchApi<InsightsResponse>(path);
}

/** GET /ranking?city=... */
export async function fetchRanking(
  city?: string
): Promise<{ data: RankingResponse | null; error: string | null }> {
  const path = city ? `/ranking?city=${encodeURIComponent(city)}` : "/ranking";
  return fetchApi<RankingResponse>(path);
}

/** GET / - backend status */
export async function fetchRoot(): Promise<{ data: { message: string } | null; error: string | null }> {
  return fetchApi<{ message: string }>("/");
}
