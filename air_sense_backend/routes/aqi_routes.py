"""
AQI routes: GET /aqi by latitude and longitude.
"""
from fastapi import APIRouter, Query

from services import aqi_service
from schemas.aqi_schema import AQIResponse

router = APIRouter(prefix="/aqi", tags=["AQI"])


@router.get("", response_model=AQIResponse)
async def get_aqi(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
) -> AQIResponse:
    """Get current AQI for given coordinates. Request is logged to aqi_logs."""
    return await aqi_service.get_aqi(lat=lat, lon=lon)
