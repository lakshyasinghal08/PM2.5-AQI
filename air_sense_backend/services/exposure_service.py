"""
Exposure calculator: score and risk from AQI, hours outside, activity, age.
"""
from schemas.exposure_schema import (
    ExposureRequest,
    ExposureResponse,
    ActivityLevel,
    AgeGroup,
)


# Multipliers for activity (more exertion = more inhalation)
ACTIVITY_MULTIPLIER: dict[ActivityLevel, float] = {
    "Low": 1.0,
    "Moderate": 1.5,
    "High": 2.0,
}

# Sensitivity by age group
AGE_MULTIPLIER: dict[AgeGroup, float] = {
    "Child": 1.3,
    "Adult": 1.0,
    "Elderly": 1.4,
}


def calculate_exposure(req: ExposureRequest) -> ExposureResponse:
    """
    Compute exposure score from AQI, hours outside, activity level, and age group.
    Score is 0–100; risk level and advisory are derived from it.
    """
    base = (req.aqi / 500) * 50
    base *= (req.hours_outside / 24)
    base *= ACTIVITY_MULTIPLIER[req.activity_level]
    base *= AGE_MULTIPLIER[req.age_group]
    exposure_score = min(100, max(0, int(round(base))))

    if exposure_score < 33:
        risk_level = "Low"
        advisory = "Minimal health risk. Normal outdoor activities are generally fine."
    elif exposure_score < 66:
        risk_level = "Medium"
        advisory = (
            "Moderate exposure. Consider reducing prolonged outdoor exertion; "
            "sensitive groups should take extra care."
        )
    else:
        risk_level = "High"
        advisory = (
            "High exposure. Limit outdoor activity, especially for sensitive groups. "
            "Consider staying indoors when possible."
        )

    return ExposureResponse(
        exposure_score=exposure_score,
        risk_level=risk_level,
        advisory=advisory,
    )
