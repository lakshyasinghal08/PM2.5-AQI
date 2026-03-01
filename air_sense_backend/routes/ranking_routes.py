"""
Ranking routes: GET /ranking by optional city.
"""
from fastapi import APIRouter, Query

from services import ranking_service

router = APIRouter(prefix="/ranking", tags=["Ranking"])


@router.get("")
async def get_ranking(
    city: str | None = Query(None, description="Filter by city name"),
) -> dict:
    """7-day average AQI and Clean Air Score; top clean and top polluted areas."""
    return await ranking_service.get_ranking(city=city)
