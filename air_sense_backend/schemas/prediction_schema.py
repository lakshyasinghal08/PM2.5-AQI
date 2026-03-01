"""
Pydantic schemas for AQI prediction requests and responses.
"""
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """Request body for POST /predict."""

    current_aqi: int = Field(..., ge=0, le=500, description="Current AQI value")
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Humidity percentage")
    wind_speed: float = Field(..., ge=0, description="Wind speed (e.g. km/h or m/s)")


class PredictionResponse(BaseModel):
    """Response for POST /predict."""

    predicted_aqi: int = Field(..., ge=0, description="Predicted AQI value")
    trend: str = Field(..., description="'Improving' or 'Worsening'")
    confidence: str = Field(..., description="'High' or 'Medium'")
