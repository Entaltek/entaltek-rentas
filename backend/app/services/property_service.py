import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError, ValidationError
from app.core.slugify import build_slug
from app.models.property import Property, PropertyImage, PropertyStatus
from app.schemas.property import PropertyCreate, PropertyUpdate


async def _get_with_images(db: AsyncSession, property_id: uuid.UUID) -> Property:
    result = await db.execute(
        select(Property).where(Property.id == property_id).options(selectinload(Property.images))
    )
    prop = result.scalar_one_or_none()
    if prop is None:
        raise NotFoundError("Property not found.")
    return prop


async def create_property(db: AsyncSession, payload: PropertyCreate) -> Property:
    prop = Property(**payload.model_dump())
    db.add(prop)
    await db.commit()
    return await _get_with_images(db, prop.id)


async def get_property_by_id(db: AsyncSession, property_id: uuid.UUID) -> Property:
    return await _get_with_images(db, property_id)


async def get_property_by_slug(db: AsyncSession, slug: str) -> Property:
    result = await db.execute(
        select(Property)
        .where(Property.slug == slug, Property.status == PropertyStatus.published)
        .options(selectinload(Property.images))
    )
    prop = result.scalar_one_or_none()
    if prop is None:
        raise NotFoundError("Property not found.")
    return prop


async def update_property(
    db: AsyncSession, property_id: uuid.UUID, payload: PropertyUpdate
) -> Property:
    prop = await _get_with_images(db, property_id)
    if prop.status == PropertyStatus.archived:
        raise ValidationError("Archived properties cannot be modified.")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(prop, key, value)
    await db.commit()
    return await _get_with_images(db, property_id)


async def publish_property(db: AsyncSession, property_id: uuid.UUID) -> Property:
    prop = await _get_with_images(db, property_id)
    if prop.status == PropertyStatus.archived:
        raise ValidationError("Archived properties cannot be published.")
    if prop.status == PropertyStatus.published:
        return prop

    slug_base = build_slug(prop.title, prop.zone, prop.price)
    slug = slug_base
    counter = 1
    while True:
        existing = await db.execute(
            select(Property).where(Property.slug == slug, Property.id != prop.id)
        )
        if existing.scalar_one_or_none() is None:
            break
        slug = f"{slug_base}-{counter}"
        counter += 1

    prop.slug = slug
    prop.status = PropertyStatus.published
    prop.published_at = datetime.now(tz=UTC)
    await db.commit()
    return await _get_with_images(db, property_id)


async def archive_property(db: AsyncSession, property_id: uuid.UUID) -> Property:
    prop = await _get_with_images(db, property_id)
    prop.status = PropertyStatus.archived
    await db.commit()
    return await _get_with_images(db, property_id)


async def add_images(
    db: AsyncSession,
    property_id: uuid.UUID,
    image_urls: list[str],
) -> list[PropertyImage]:
    from app.core.config import settings

    prop = await _get_with_images(db, property_id)
    current_images = prop.images

    if len(current_images) + len(image_urls) > settings.IMAGES_PER_PROPERTY_MAX:
        raise ValidationError(
            f"Cannot exceed {settings.IMAGES_PER_PROPERTY_MAX} images per property."
        )

    has_cover = any(img.is_cover for img in current_images)
    max_sort = max((img.sort_order for img in current_images), default=-1)

    new_images: list[PropertyImage] = []
    for i, url in enumerate(image_urls):
        is_cover = not has_cover and i == 0
        img = PropertyImage(
            property_id=property_id,
            url=url,
            sort_order=max_sort + 1 + i,
            is_cover=is_cover,
        )
        db.add(img)
        new_images.append(img)

    await db.commit()

    new_urls = set(image_urls)
    result = await db.execute(
        select(PropertyImage).where(PropertyImage.property_id == property_id)
    )
    return [img for img in result.scalars().all() if img.url in new_urls]


async def delete_image(
    db: AsyncSession, property_id: uuid.UUID, image_id: uuid.UUID
) -> PropertyImage:
    result = await db.execute(
        select(PropertyImage).where(
            PropertyImage.id == image_id, PropertyImage.property_id == property_id
        )
    )
    img = result.scalar_one_or_none()
    if img is None:
        raise NotFoundError("Image not found.")
    await db.delete(img)
    await db.commit()
    return img
