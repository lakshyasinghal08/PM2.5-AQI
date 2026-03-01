"""
AQI service: simulate/fetch AQI by coordinates and persist to aqi_logs.
"""
import math
from datetime import datetime

from config.database import get_collection
from schemas.aqi_schema import AQIResponse, Pollutants, AQILogCreate


def _aqi_category(aqi: int) -> str:
    if aqi <= 50:
        return "Good"
    if aqi <= 100:
        return "Moderate"
    if aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    if aqi <= 200:
        return "Unhealthy"
    if aqi <= 300:
        return "Very Unhealthy"
    return "Hazardous"


def _simulate_aqi(lat: float, lon: float) -> tuple[int, Pollutants]:
    """Generate deterministic pseudo-realistic AQI from lat/lon (simulation)."""
    # Use lat/lon to seed variation so same location gives stable result
    t = math.sin(lat * 0.1) * math.cos(lon * 0.1) + 1
    base = 30 + int((t * 80) % 120)
    aqi = min(max(base, 0), 500)
    # Derive rough pollutant ratios (simplified)
    pm25 = round(aqi * 0.4 + (lat % 5) * 2, 2)
    pm10 = round(pm25 * 1.5 + (lon % 3), 2)
    co = round(0.5 + (aqi / 200) * 2, 2)
    no2 = round(20 + (aqi / 50) * 10, 2)
    return aqi, Pollutants(pm25=pm25, pm10=pm10, co=co, no2=no2)


async def get_aqi(lat: float, lon: float) -> AQIResponse:
    """Compute AQI for given coordinates, log to MongoDB, return response."""
    aqi, pollutants = _simulate_aqi(lat, lon)
    category = _aqi_category(aqi)
    response = AQIResponse(aqi=aqi, category=category, pollutants=pollutants)

    log = AQILogCreate(
        lat=lat,
        lon=lon,
        aqi=aqi,
        category=category,
        pollutants=pollutants,
    )
    doc = {
        **log.model_dump(),
        "created_at": datetime.utcnow(),
        "city": None,  # Can be set by client or geocoding later
    }
    coll = get_collection("aqi_logs")
    await coll.insert_one(doc)

    return response
