"""
Insight routes: GET /insights by optional city.
"""
from fastapi import APIRouter, Query

from services import insight_service

router = APIRouter(prefix="/insights", tags=["Insights"])


@router.get("")
async def get_insights(
    city: str | None = Query(None, description="Filter by city name"),
) -> dict:
    """Analyze last 24 AQI records: percentage change, peak hour, trend summary."""
    return await insight_service.get_insights(city=city)
