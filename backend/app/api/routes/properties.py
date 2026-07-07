import uuid

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.property import PropertyCreate, PropertyOut, PropertyUpdate
from app.services import property_service
from app.services.storage import get_storage

router = APIRouter(prefix="/properties", tags=["properties"])


@router.post("", response_model=PropertyOut, status_code=201)
async def create_property(
    payload: PropertyCreate,
    db: AsyncSession = Depends(get_db),
) -> PropertyOut:
    prop = await property_service.create_property(db, payload)
    return PropertyOut.model_validate(prop)


@router.get("/{slug}", response_model=PropertyOut)
async def get_property_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
) -> PropertyOut:
    prop = await property_service.get_property_by_slug(db, slug)
    return PropertyOut.model_validate(prop)


@router.patch("/{property_id}", response_model=PropertyOut)
async def update_property(
    property_id: uuid.UUID,
    payload: PropertyUpdate,
    db: AsyncSession = Depends(get_db),
) -> PropertyOut:
    prop = await property_service.update_property(db, property_id, payload)
    return PropertyOut.model_validate(prop)


@router.post("/{property_id}/publish", response_model=PropertyOut)
async def publish_property(
    property_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> PropertyOut:
    prop = await property_service.publish_property(db, property_id)
    return PropertyOut.model_validate(prop)


@router.post("/{property_id}/archive", response_model=PropertyOut)
async def archive_property(
    property_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> PropertyOut:
    prop = await property_service.archive_property(db, property_id)
    return PropertyOut.model_validate(prop)


@router.post("/{property_id}/images", response_model=list, status_code=201)
async def upload_images(
    property_id: uuid.UUID,
    files: list[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
) -> list:
    storage = get_storage()
    urls: list[str] = []
    for file in files:
        data = await file.read()
        url = await storage.save(data, file.filename or "image", folder=str(property_id))
        urls.append(url)

    images = await property_service.add_images(db, property_id, urls)
    from app.schemas.property import PropertyImageOut

    return [PropertyImageOut.model_validate(img) for img in images]


@router.delete("/{property_id}/images/{image_id}", status_code=204)
async def delete_image(
    property_id: uuid.UUID,
    image_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    storage = get_storage()
    img = await property_service.delete_image(db, property_id, image_id)
    await storage.delete(img.url)
