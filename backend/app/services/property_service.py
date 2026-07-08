import base64
import binascii
import re
import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError, ValidationError
from app.core.slugify import build_slug
from app.models.property import Property, PropertyPhoto, PropertyStatus
from app.schemas.property import PropertyPayload, PropertyPhotoModel
from app.services.storage import get_storage

_DATA_URL_RE = re.compile(r"^data:image/(png|jpeg|jpg|webp);base64,(.+)$", re.DOTALL)


async def _get_with_photos(db: AsyncSession, property_id: uuid.UUID) -> Property:
    result = await db.execute(
        select(Property).where(Property.id == property_id).options(selectinload(Property.photos))
    )
    prop = result.scalar_one_or_none()
    if prop is None:
        raise NotFoundError("La propiedad no existe.")
    return prop


async def list_properties(db: AsyncSession) -> list[Property]:
    result = await db.execute(
        select(Property).options(selectinload(Property.photos)).order_by(Property.updated_at.desc())
    )
    return list(result.scalars().all())


async def get_property_by_id(db: AsyncSession, property_id: uuid.UUID) -> Property:
    return await _get_with_photos(db, property_id)


async def get_property_by_slug(db: AsyncSession, slug: str) -> Property:
    # Devuelve la propiedad sin filtrar por status: el frontend distingue entre
    # "no existe" (404) y "publicación no activa" (status != published).
    result = await db.execute(
        select(Property).where(Property.slug == slug).options(selectinload(Property.photos))
    )
    prop = result.scalar_one_or_none()
    if prop is None:
        raise NotFoundError("La propiedad no existe.")
    return prop


async def create_property(db: AsyncSession, payload: PropertyPayload) -> Property:
    prop = Property(id=uuid.uuid4(), photos=[])
    _apply_payload(prop, payload)
    db.add(prop)
    await db.flush()
    await _sync_photos(db, prop, payload.photos)
    await db.commit()
    return await _get_with_photos(db, prop.id)


async def update_property(
    db: AsyncSession, property_id: uuid.UUID, payload: PropertyPayload
) -> Property:
    prop = await _get_with_photos(db, property_id)
    _apply_payload(prop, payload)
    await _sync_photos(db, prop, payload.photos)
    await db.commit()
    return await _get_with_photos(db, property_id)


async def publish_property(db: AsyncSession, property_id: uuid.UUID) -> Property:
    prop = await _get_with_photos(db, property_id)

    errors = _validate_for_publish(prop)
    if errors:
        raise ValidationError("Faltan datos para publicar: " + " ".join(errors))

    if prop.status == PropertyStatus.published:
        return prop

    if not prop.slug:
        prop.slug = await _generate_unique_slug(db, prop)
    prop.status = PropertyStatus.published
    if prop.published_at is None:
        prop.published_at = datetime.now(tz=UTC)
    await db.commit()
    return await _get_with_photos(db, property_id)


async def unpublish_property(db: AsyncSession, property_id: uuid.UUID) -> Property:
    prop = await _get_with_photos(db, property_id)
    prop.status = PropertyStatus.unpublished
    await db.commit()
    return await _get_with_photos(db, property_id)


async def delete_property(db: AsyncSession, property_id: uuid.UUID) -> None:
    prop = await _get_with_photos(db, property_id)
    storage = get_storage()
    for photo in prop.photos:
        await storage.delete(photo.url)
    await db.delete(prop)
    await db.commit()


def _apply_payload(prop: Property, payload: PropertyPayload) -> None:
    prop.title = payload.title
    prop.property_type = payload.propertyType
    prop.operation_type = payload.operationType
    prop.description = payload.description
    prop.price = payload.price
    prop.currency = payload.currency
    prop.price_period = payload.pricePeriod
    prop.maintenance_included = payload.maintenanceIncluded
    prop.deposit_text = payload.depositText
    prop.minimum_contract_text = payload.minimumContractText
    prop.available_from = payload.availableFrom
    prop.bedrooms = payload.bedrooms
    prop.bathrooms = payload.bathrooms
    prop.parking_spaces = payload.parkingSpaces
    prop.area_m2 = payload.areaM2
    prop.furnished = payload.furnished
    prop.pets_allowed = payload.petsAllowed
    prop.services_included = payload.servicesIncluded
    prop.amenities = payload.amenities
    prop.requirements = payload.requirements
    prop.location_country = payload.location.country
    prop.location_state = payload.location.state
    prop.location_city = payload.location.city
    prop.location_neighborhood = payload.location.neighborhood
    prop.location_address = payload.location.address
    prop.location_references = payload.location.references
    prop.location_lat = payload.location.lat
    prop.location_lng = payload.location.lng
    prop.show_exact_address = payload.location.showExactAddress
    prop.nearby_places = [place.model_dump() for place in payload.location.nearbyPlaces]
    prop.contact_name = payload.contact.name
    prop.contact_whatsapp = payload.contact.whatsapp
    prop.contact_email = payload.contact.email


async def _sync_photos(
    db: AsyncSession, prop: Property, photos: list[PropertyPhotoModel]
) -> None:
    """Reemplaza el set de fotos con el del payload. Las urls `data:image/...`
    se materializan en el storage; las urls ya almacenadas se conservan y los
    archivos que dejaron de usarse se eliminan del storage."""
    storage = get_storage()
    old_urls = {photo.url for photo in prop.photos}

    resolved: list[tuple[PropertyPhotoModel, str]] = []
    for photo in photos:
        resolved.append((photo, await _resolve_photo_url(storage, photo.url)))

    ordered = sorted(resolved, key=lambda item: (not item[0].isCover, item[0].order))

    # Reemplazo vía la relación (delete-orphan): mutarla mantiene consistente
    # el unit of work; borrar las filas directamente las "resucita" al flush.
    prop.photos.clear()
    await db.flush()

    new_urls = set()
    for index, (photo, url) in enumerate(ordered):
        new_urls.add(url)
        prop.photos.append(
            PropertyPhoto(
                url=url,
                title=photo.title.strip(),
                alt_text=(photo.alt or photo.title).strip() or None,
                sort_order=index,
                is_cover=index == 0,
            )
        )

    for url in old_urls - new_urls:
        await storage.delete(url)


async def _resolve_photo_url(storage, url: str) -> str:
    match = _DATA_URL_RE.match(url)
    if not match:
        return url

    extension, encoded = match.groups()
    try:
        data = base64.b64decode(encoded, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise ValidationError("Una de las fotos no se pudo procesar. Intenta subirla de nuevo.") from exc

    return await storage.save(data, f"photo.{extension}", folder="properties")


def _validate_for_publish(prop: Property) -> list[str]:
    errors: list[str] = []
    if not prop.title.strip():
        errors.append("Agrega un título.")
    if not prop.price or float(prop.price) <= 0:
        errors.append("Indica un precio mayor a cero.")
    if not prop.location_city.strip():
        errors.append("Indica la ciudad.")
    if not prop.location_neighborhood.strip() and not prop.location_address.strip():
        errors.append("Agrega la colonia/zona o el domicilio.")
    if len(re.sub(r"\D", "", prop.contact_whatsapp)) < 10:
        errors.append("Agrega un WhatsApp válido de al menos 10 dígitos.")
    return errors


async def _generate_unique_slug(db: AsyncSession, prop: Property) -> str:
    slug_base = build_slug(prop.title, prop.location_neighborhood or prop.location_city, prop.price)
    slug = slug_base
    counter = 1
    while True:
        existing = await db.execute(
            select(Property).where(Property.slug == slug, Property.id != prop.id)
        )
        if existing.scalar_one_or_none() is None:
            return slug
        slug = f"{slug_base}-{counter}"
        counter += 1
