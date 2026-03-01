"""
Ranking service: 7-day average AQI and Clean Air Score by area (e.g. city).
"""
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorCollection

from config.database import get_collection


async def get_ranking(city: str | None = None) -> dict:
    """
    Compute 7-day average AQI per area (e.g. city or lat/lon bucket).
    Clean Air Score 0–100 (100 = clean). Return top clean and top polluted areas.
    """
    coll: AsyncIOMotorCollection = get_collection("aqi_logs")
    since = datetime.utcnow() - timedelta(days=7)
    query: dict = {"created_at": {"$gte": since}}
    if city:
        query["city"] = city

    cursor = coll.find(query)
    records = await cursor.to_list(length=None)

    # Group by area key: use city if present, else "lat,lon" bucket
    area_aqis: dict[str, list[int]] = {}
    for r in records:
        if r.get("city"):
            key = str(r["city"])
        else:
            lat, lon = r.get("lat"), r.get("lon")
            bucket = f"{round(float(lat), 2)},{round(float(lon), 2)}" if lat is not None and lon is not None else "unknown"
            key = bucket
        area_aqis.setdefault(key, []).append(r["aqi"])

    # 7-day average and Clean Air Score (100 - normalized AQI, capped 0–100)
    area_stats: list[tuple[str, float, int]] = []
    for area, aqis in area_aqis.items():
        avg_aqi = sum(aqis) / len(aqis)
        clean_score = max(0, min(100, int(round(100 - (avg_aqi / 500) * 100))))
        area_stats.append((area, avg_aqi, clean_score))

    area_stats.sort(key=lambda x: x[2], reverse=True)
    top_clean = [{"area": a, "avg_aqi": round(avg, 2), "clean_air_score": score} for a, avg, score in area_stats[:10]]
    area_stats.sort(key=lambda x: x[1], reverse=True)
    top_polluted = [{"area": a, "avg_aqi": round(avg, 2), "clean_air_score": score} for a, avg, score in area_stats[:10]]

    return {
        "top_clean_areas": top_clean,
        "top_polluted_areas": top_polluted,
        "city_filter": city,
    }
