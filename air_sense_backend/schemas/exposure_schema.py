"""
Pydantic schemas for exposure calculator requests and responses.
"""
from typing import Literal
from pydantic import BaseModel, Field


ActivityLevel = Literal["Low", "Moderate", "High"]
AgeGroup = Literal["Child", "Adult", "Elderly"]


class ExposureRequest(BaseModel):
    """Request body for POST /exposure."""

    aqi: int = Field(..., ge=0, le=500, description="Air Quality Index")
    hours_outside: float = Field(..., ge=0, le=24, description="Hours spent outdoors")
    activity_level: ActivityLevel = Field(..., description="Physical activity level")
    age_group: AgeGroup = Field(..., description="Age group for risk assessment")


class ExposureResponse(BaseModel):
    """Response for POST /exposure."""

    exposure_score: int = Field(..., ge=0, description="Calculated exposure score")
    risk_level: Literal["Low", "Medium", "High"] = Field(
        ..., description="Risk level category"
    )
    advisory: str = Field(..., description="Human-readable advisory message")
