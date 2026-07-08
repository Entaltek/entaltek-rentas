from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PropertyStatus(StrEnum):
    draft = "draft"
    published = "published"
    unpublished = "unpublished"


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True, index=True)
    status: Mapped[PropertyStatus] = mapped_column(
        String(20), nullable=False, default=PropertyStatus.draft
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    property_type: Mapped[str] = mapped_column(String(50), nullable=False, default="departamento")
    operation_type: Mapped[str] = mapped_column(String(50), nullable=False, default="renta")
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")

    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="MXN")
    price_period: Mapped[str] = mapped_column(String(20), nullable=False, default="monthly")
    maintenance_included: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    deposit_text: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    minimum_contract_text: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    available_from: Mapped[str] = mapped_column(String(100), nullable=False, default="")

    bedrooms: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    bathrooms: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    parking_spaces: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    area_m2: Mapped[int | None] = mapped_column(Integer, nullable=True)
    furnished: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    pets_allowed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    services_included: Mapped[list | None] = mapped_column(JSON, nullable=True)
    amenities: Mapped[list | None] = mapped_column(JSON, nullable=True)
    requirements: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # Ubicación (aplanada en columnas; nearby_places como JSON)
    location_country: Mapped[str] = mapped_column(String(100), nullable=False, default="México")
    location_state: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    location_city: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    location_neighborhood: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    location_address: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    location_references: Mapped[str] = mapped_column(Text, nullable=False, default="")
    location_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    location_lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    show_exact_address: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    nearby_places: Mapped[list | None] = mapped_column(JSON, nullable=True)

    contact_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    contact_whatsapp: Mapped[str] = mapped_column(String(30), nullable=False, default="")
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # TODO: add owner_id FK when auth is implemented
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    photos: Mapped[list[PropertyPhoto]] = relationship(
        "PropertyPhoto",
        back_populates="property",
        cascade="all, delete-orphan",
        order_by="PropertyPhoto.sort_order",
    )
    leads: Mapped[list[Lead]] = relationship(
        "Lead", back_populates="property", cascade="all, delete-orphan"
    )


class PropertyPhoto(Base):
    __tablename__ = "property_images"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False
    )
    url: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    alt_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_cover: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    property: Mapped[Property] = relationship("Property", back_populates="photos")


# Avoid circular import at type-check time
from app.models.lead import Lead  # noqa: E402
