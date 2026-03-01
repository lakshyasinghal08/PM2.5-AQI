from fastapi import APIRouter
from datetime import datetime

from services import prediction_service
from schemas.prediction_schema import PredictionRequest, PredictionResponse
from config.database import get_collection

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post("", response_model=PredictionResponse)
async def predict_aqi(body: PredictionRequest) -> PredictionResponse:

    result = prediction_service.predict_aqi_placeholder(body)

    collection = get_collection("aqi_logs")

    await collection.insert_one({
        "input_data": body.model_dump(),
        "predicted_aqi": result.predicted_aqi,
        "timestamp": datetime.utcnow()
    })

    return result