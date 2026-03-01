"""
Pydantic schemas for AQI-related requests and responses.
"""
from pydantic import BaseModel, Field


class Pollutants(BaseModel):
    """Pollutant concentrations (e.g. µg/m³, ppm as applicable)."""

    pm25: float = Field(..., ge=0, description="PM2.5 concentration")
    pm10: float = Field(..., ge=0, description="PM10 concentration")
    co: float = Field(..., ge=0, description="CO concentration")
    no2: float = Field(..., ge=0, description="NO2 concentration")


class AQIResponse(BaseModel):
    """Response for GET /aqi."""

    aqi: int = Field(..., ge=0, le=500, description="Air Quality Index value")
    category: str = Field(..., description="AQI category label")
    pollutants: Pollutants = Field(..., description="Pollutant breakdown")


class AQILogCreate(BaseModel):
    """Document stored in aqi_logs (internal/schema for logging)."""

    lat: float
    lon: float
    aqi: int
    category: str
    pollutants: Pollutants
