"""
Insight service: analyze last 24 AQI records and return trend summary.
"""
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorCollection

from config.database import get_collection


async def get_insights(city: str | None = None) -> dict:
    """
    Analyze last 24 records from aqi_logs, optionally filtered by city.
    Returns percentage change, peak pollution hour, and trend summary.
    """
    coll: AsyncIOMotorCollection = get_collection("aqi_logs")
    since = datetime.utcnow() - timedelta(hours=24)
    query: dict = {"created_at": {"$gte": since}}
    if city:
        query["city"] = city

    cursor = coll.find(query).sort("created_at", -1).limit(24)
    records = await cursor.to_list(length=24)
    records.reverse()

    if len(records) < 2:
        return {
            "percentage_change": None,
            "peak_pollution_hour": None,
            "trend_summary": "Insufficient data in the last 24 hours.",
            "record_count": len(records),
            "city": city,
        }

    aqis = [r["aqi"] for r in records]
    first_aqi = aqis[0]
    last_aqi = aqis[-1]
    if first_aqi == 0:
        percentage_change = 0.0 if last_aqi == 0 else 100.0
    else:
        percentage_change = round(((last_aqi - first_aqi) / first_aqi) * 100, 2)

    hour_to_avg: dict[int, list[int]] = {}
    for r in records:
        created = r.get("created_at")
        if isinstance(created, datetime):
            h = created.hour
        else:
            h = 12
        hour_to_avg.setdefault(h, []).append(r["aqi"])
    hour_avgs = {h: sum(v) / len(v) for h, v in hour_to_avg.items()}
    peak_pollution_hour = max(hour_avgs, key=hour_avgs.get) if hour_avgs else None

    if percentage_change > 5:
        trend_summary = "Pollution has increased over the last 24 hours."
    elif percentage_change < -5:
        trend_summary = "Pollution has decreased over the last 24 hours."
    else:
        trend_summary = "Pollution levels have remained relatively stable."

    return {
        "percentage_change": percentage_change,
        "peak_pollution_hour": peak_pollution_hour,
        "trend_summary": trend_summary,
        "record_count": len(records),
        "city": city,
        "first_aqi": first_aqi,
        "last_aqi": last_aqi,
    }
