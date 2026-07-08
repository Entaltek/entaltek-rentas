"""Esquemas del contrato público de la API.

El frontend habla camelCase y envía/recibe el documento Property completo,
por eso los campos de estos modelos están en camelCase de forma literal.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.property import Property, PropertyPhoto, PropertyStatus


class NearbyPlaceModel(BaseModel):
    model_config = {"extra": "ignore"}

    id: str = ""
    name: str = ""
    type: str = "otro"
    distanceText: str | None = None
    distanceMeters: float | None = None


class PropertyLocationModel(BaseModel):
    model_config = {"extra": "ignore"}

    country: str = "México"
    state: str = ""
    city: str = ""
    neighborhood: str = ""
    address: str = ""
    references: str = ""
    lat: float | None = None
    lng: float | None = None
    showExactAddress: bool = False
    nearbyPlaces: list[NearbyPlaceModel] = Field(default_factory=list)


class PropertyContactModel(BaseModel):
    model_config = {"extra": "ignore"}

    name: str = ""
    whatsapp: str = ""
    email: str | None = None


class PropertyPhotoModel(BaseModel):
    model_config = {"extra": "ignore"}

    id: str = ""
    url: str
    title: str = ""
    alt: str = ""
    isCover: bool = False
    order: int = 0


class PropertyPayload(BaseModel):
    """Body de POST/PUT: el documento completo; los campos controlados por el
    servidor (id, slug, status, timestamps) se ignoran si vienen del cliente."""

    model_config = {"extra": "ignore"}

    title: str = Field("", max_length=255)
    propertyType: str = Field("departamento", max_length=50)
    operationType: str = Field("renta", max_length=50)
    description: str = ""
    price: float = Field(0, ge=0)
    currency: str = Field("MXN", pattern=r"^[A-Z]{3}$")
    pricePeriod: str = Field("monthly", max_length=20)
    maintenanceIncluded: bool = False
    depositText: str = Field("", max_length=255)
    minimumContractText: str = Field("", max_length=255)
    availableFrom: str = Field("", max_length=100)
    bedrooms: int = Field(0, ge=0)
    bathrooms: int = Field(0, ge=0)
    parkingSpaces: int = Field(0, ge=0)
    areaM2: int | None = Field(None, gt=0)
    furnished: bool = False
    petsAllowed: bool = False
    servicesIncluded: list[str] = Field(default_factory=list)
    amenities: list[str] = Field(default_factory=list)
    requirements: list[str] = Field(default_factory=list)
    location: PropertyLocationModel = Field(default_factory=PropertyLocationModel)
    contact: PropertyContactModel = Field(default_factory=PropertyContactModel)
    photos: list[PropertyPhotoModel] = Field(default_factory=list)


class PropertyOut(BaseModel):
    id: uuid.UUID
    slug: str
    status: PropertyStatus
    title: str
    propertyType: str
    operationType: str
    description: str
    price: float
    currency: str
    pricePeriod: str
    maintenanceIncluded: bool
    depositText: str
    minimumContractText: str
    availableFrom: str
    bedrooms: int
    bathrooms: int
    parkingSpaces: int
    areaM2: int | None
    furnished: bool
    petsAllowed: bool
    servicesIncluded: list[str]
    amenities: list[str]
    requirements: list[str]
    location: PropertyLocationModel
    contact: PropertyContactModel
    photos: list[PropertyPhotoModel]
    createdAt: datetime
    updatedAt: datetime
    publishedAt: datetime | None

    @classmethod
    def from_model(cls, prop: Property) -> "PropertyOut":
        return cls(
            id=prop.id,
            slug=prop.slug or "",
            status=prop.status,
            title=prop.title,
            propertyType=prop.property_type,
            operationType=prop.operation_type,
            description=prop.description,
            price=float(prop.price),
            currency=prop.currency,
            pricePeriod=prop.price_period,
            maintenanceIncluded=prop.maintenance_included,
            depositText=prop.deposit_text,
            minimumContractText=prop.minimum_contract_text,
            availableFrom=prop.available_from,
            bedrooms=prop.bedrooms,
            bathrooms=prop.bathrooms,
            parkingSpaces=prop.parking_spaces,
            areaM2=prop.area_m2,
            furnished=prop.furnished,
            petsAllowed=prop.pets_allowed,
            servicesIncluded=list(prop.services_included or []),
            amenities=list(prop.amenities or []),
            requirements=list(prop.requirements or []),
            location=PropertyLocationModel(
                country=prop.location_country,
                state=prop.location_state,
                city=prop.location_city,
                neighborhood=prop.location_neighborhood,
                address=prop.location_address,
                references=prop.location_references,
                lat=prop.location_lat,
                lng=prop.location_lng,
                showExactAddress=prop.show_exact_address,
                nearbyPlaces=[NearbyPlaceModel(**place) for place in (prop.nearby_places or [])],
            ),
            contact=PropertyContactModel(
                name=prop.contact_name,
                whatsapp=prop.contact_whatsapp,
                email=prop.contact_email,
            ),
            photos=[_photo_out(photo) for photo in sorted(prop.photos, key=lambda p: p.sort_order)],
            createdAt=prop.created_at,
            updatedAt=prop.updated_at,
            publishedAt=prop.published_at,
        )


def _photo_out(photo: PropertyPhoto) -> PropertyPhotoModel:
    return PropertyPhotoModel(
        id=str(photo.id),
        url=photo.url,
        title=photo.title,
        alt=photo.alt_text or photo.title,
        isCover=photo.is_cover,
        order=photo.sort_order,
    )
