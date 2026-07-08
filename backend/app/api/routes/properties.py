import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.property import PropertyOut, PropertyPayload
from app.services import property_service

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("", response_model=list[PropertyOut])
async def list_properties(db: AsyncSession = Depends(get_db)) -> list[PropertyOut]:
    props = await property_service.list_properties(db)
    return [PropertyOut.from_model(prop) for prop in props]


@router.post("", response_model=PropertyOut, status_code=201)
async def create_property(
    payload: PropertyPayload,
    db: AsyncSession = Depends(get_db),
) -> PropertyOut:
    prop = await property_service.create_property(db, payload)
    return PropertyOut.from_model(prop)


@router.get("/slug/{slug}", response_model=PropertyOut)
async def get_property_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
) -> PropertyOut:
    prop = await property_service.get_property_by_slug(db, slug)
    return PropertyOut.from_model(prop)


@router.get("/{property_id}", response_model=PropertyOut)
async def get_property_by_id(
    property_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> PropertyOut:
    prop = await property_service.get_property_by_id(db, property_id)
    return PropertyOut.from_model(prop)


@router.put("/{property_id}", response_model=PropertyOut)
async def update_property(
    property_id: uuid.UUID,
    payload: PropertyPayload,
    db: AsyncSession = Depends(get_db),
) -> PropertyOut:
    prop = await property_service.update_property(db, property_id, payload)
    return PropertyOut.from_model(prop)


@router.patch("/{property_id}/publish", response_model=PropertyOut)
async def publish_property(
    property_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> PropertyOut:
    prop = await property_service.publish_property(db, property_id)
    return PropertyOut.from_model(prop)


@router.patch("/{property_id}/unpublish", response_model=PropertyOut)
async def unpublish_property(
    property_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> PropertyOut:
    prop = await property_service.unpublish_property(db, property_id)
    return PropertyOut.from_model(prop)


@router.delete("/{property_id}", status_code=204)
async def delete_property(
    property_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    await property_service.delete_property(db, property_id)
