"""
Pydantic schemas for user-related models (placeholder for future auth/profile).
"""
from pydantic import BaseModel, Field


class UserBase(BaseModel):
    """Base user fields."""

    email: str | None = None
    name: str | None = None


class UserCreate(UserBase):
    """Schema for creating a user."""

    pass


class UserResponse(UserBase):
    """User as returned by API."""

    id: str | None = None

    class Config:
        from_attributes = True
