import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.property import PropertyStatus


class PropertyImageOut(BaseModel):
    id: uuid.UUID
    url: str
    alt_text: str | None = None
    sort_order: int
    is_cover: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PropertyCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    property_type: str = Field(..., min_length=1, max_length=100)
    price: Decimal = Field(..., gt=0, decimal_places=2)
    currency: str = Field("MXN", pattern=r"^[A-Z]{3}$")
    zone: str = Field(..., min_length=1, max_length=255)
    city: str = Field(..., min_length=1, max_length=255)
    bedrooms: int = Field(..., ge=0)
    bathrooms: int = Field(..., ge=0)
    parking_spots: int = Field(0, ge=0)
    area_m2: int | None = Field(None, gt=0)
    furnished: bool = False
    pets_allowed: bool = False
    maintenance_included: bool = False
    deposit_months: int = Field(1, ge=1)
    minimum_stay_months: int | None = Field(None, ge=1)
    available_from: str = Field(..., min_length=1, max_length=20)
    description: str | None = None
    requirements: list[str] | None = None
    amenities: list[str] | None = None
    contact_name: str = Field(..., min_length=1, max_length=255)
    whatsapp: str = Field(..., min_length=7, max_length=30)


class PropertyUpdate(BaseModel):
    title: str | None = Field(None, min_length=3, max_length=255)
    property_type: str | None = Field(None, min_length=1, max_length=100)
    price: Decimal | None = Field(None, gt=0, decimal_places=2)
    currency: str | None = Field(None, pattern=r"^[A-Z]{3}$")
    zone: str | None = Field(None, min_length=1, max_length=255)
    city: str | None = Field(None, min_length=1, max_length=255)
    bedrooms: int | None = Field(None, ge=0)
    bathrooms: int | None = Field(None, ge=0)
    parking_spots: int | None = Field(None, ge=0)
    area_m2: int | None = Field(None, gt=0)
    furnished: bool | None = None
    pets_allowed: bool | None = None
    maintenance_included: bool | None = None
    deposit_months: int | None = Field(None, ge=1)
    minimum_stay_months: int | None = Field(None, ge=1)
    available_from: str | None = Field(None, min_length=1, max_length=20)
    description: str | None = None
    requirements: list[str] | None = None
    amenities: list[str] | None = None
    contact_name: str | None = Field(None, min_length=1, max_length=255)
    whatsapp: str | None = Field(None, min_length=7, max_length=30)


class PropertyOut(BaseModel):
    id: uuid.UUID
    slug: str | None
    title: str
    property_type: str
    price: Decimal
    currency: str
    zone: str
    city: str
    bedrooms: int
    bathrooms: int
    parking_spots: int
    area_m2: int | None
    furnished: bool
    pets_allowed: bool
    maintenance_included: bool
    deposit_months: int
    minimum_stay_months: int | None
    available_from: str
    description: str | None
    requirements: list[str] | None
    amenities: list[str] | None
    contact_name: str
    whatsapp: str
    status: PropertyStatus
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None
    images: list[PropertyImageOut] = []

    model_config = {"from_attributes": True}
