"""
Database configuration and async MongoDB connection for Air Sense Backend.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    mongo_uri: str = Field(default="mongodb://localhost:27017", validation_alias="MONGO_URI")
    db_name: str = Field(default="air_sense_db", validation_alias="DB_NAME")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

# Global client and database references (initialized in lifespan)
_client: AsyncIOMotorClient | None = None
_db = None


async def connect_to_mongo() -> None:
    """Create async MongoDB connection and ensure collections exist. Call once at startup."""
    global _client, _db
    try:
        _client = AsyncIOMotorClient(
            settings.mongo_uri,
            serverSelectionTimeoutMS=5000,
        )
        await _client.admin.command("ping")
        _db = _client[settings.db_name]
        await _ensure_collections()
        print(f"[MongoDB] Connected to {settings.db_name} at {settings.mongo_uri}")
    except Exception as e:
        raise ConnectionError(f"Failed to connect to MongoDB: {e}") from e


async def _ensure_collections() -> None:
    """Create aqi_logs, users, exposure_logs if they do not exist."""
    existing = await _db.list_collection_names()
    for name in ("aqi_logs", "users", "exposure_logs"):
        if name not in existing:
            await _db.create_collection(name)
            print(f"[MongoDB] Created collection: {name}")


async def close_mongo_connection() -> None:
    """Close MongoDB connection. Call on shutdown."""
    global _client
    if _client:
        _client.close()
        _client = None


def get_database():
    """Return the application database. Raises if not connected."""
    if _db is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
    return _db


def get_collection(name: str):
    """Return a collection by name."""
    return get_database()[name]
