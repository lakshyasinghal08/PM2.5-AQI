"""
Exposure calculator routes: POST /exposure.
"""
from datetime import datetime

from fastapi import APIRouter

from config.database import get_collection
from services import exposure_service
from schemas.exposure_schema import ExposureRequest, ExposureResponse

router = APIRouter(prefix="/exposure", tags=["Exposure"])


@router.post("", response_model=ExposureResponse)
async def calculate_exposure(body: ExposureRequest) -> ExposureResponse:
    """Calculate exposure score and risk level from AQI, hours outside, activity, and age group."""
    result = exposure_service.calculate_exposure(body)
    coll = get_collection("exposure_logs")
    await coll.insert_one({
        "aqi": body.aqi,
        "hours_outside": body.hours_outside,
        "activity_level": body.activity_level,
        "age_group": body.age_group,
        "exposure_score": result.exposure_score,
        "risk_level": result.risk_level,
        "created_at": datetime.utcnow(),
    })
    return result
