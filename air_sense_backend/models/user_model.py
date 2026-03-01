"""
User model definitions for MongoDB (optional; for future auth/profile).
Structure is kept minimal and ML/document-friendly.
"""
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class UserModel(BaseModel):
    """User document representation for MongoDB."""

    email: str | None = None
    name: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

    def to_bson(self) -> dict[str, Any]:
        """Convert to dict suitable for MongoDB insert (e.g. id as _id)."""
        d = self.model_dump(exclude_none=True)
        if "created_at" in d and hasattr(d["created_at"], "isoformat"):
            d["created_at"] = d["created_at"]
        return d
