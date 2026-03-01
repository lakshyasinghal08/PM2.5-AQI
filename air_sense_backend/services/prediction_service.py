"""
Prediction service: regression-style AQI prediction placeholder, ML-ready.
"""
from pathlib import Path

from schemas.prediction_schema import PredictionRequest, PredictionResponse


def _load_ml_model_if_exists():
    """Load ml_model.pkl if present (placeholder for future ML integration)."""
    pkl_path = Path(__file__).resolve().parent.parent / "ml_model.pkl"
    if pkl_path.exists():
        try:
            import pickle
            with open(pkl_path, "rb") as f:
                return pickle.load(f)
        except Exception:
            pass
    return None


def predict_aqi_placeholder(req: PredictionRequest) -> PredictionResponse:
    """
    Placeholder prediction logic. Replace with model.predict() when ML model exists.
    Uses simple regression-style rules: wind lowers AQI, high temp/humidity can increase it.
    """
    model = _load_ml_model_if_exists()
    if model is not None and hasattr(model, "predict"):
        # ML path: expect model to accept array of [current_aqi, temp, humidity, wind_speed]
        try:
            import numpy as np
            X = np.array(
                [[req.current_aqi, req.temperature, req.humidity, req.wind_speed]]
            )
            predicted = int(round(float(model.predict(X)[0])))
            predicted = max(0, min(500, predicted))
        except Exception:
            predicted = _rule_based_prediction(req)
    else:
        predicted = _rule_based_prediction(req)

    trend = "Improving" if predicted <= req.current_aqi else "Worsening"
    confidence = "High" if abs(predicted - req.current_aqi) <= 20 else "Medium"
    return PredictionResponse(
        predicted_aqi=predicted,
        trend=trend,
        confidence=confidence,
    )


def _rule_based_prediction(req: PredictionRequest) -> int:
    """Simple rule-based prediction for placeholder."""
    delta = 0
    if req.wind_speed > 15:
        delta -= 15
    elif req.wind_speed > 8:
        delta -= 8
    if req.humidity > 80 and req.temperature > 30:
        delta += 12
    elif req.humidity > 60:
        delta += 5
    predicted = req.current_aqi + delta
    return max(0, min(500, predicted))
