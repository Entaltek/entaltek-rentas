import base64

import pytest
from httpx import AsyncClient

# 1x1 px JPEG válido para probar fotos como data URL
_TINY_JPEG = base64.b64decode(
    "/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a"
    "HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAA"
    "AAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q=="
)
TINY_JPEG_DATA_URL = "data:image/jpeg;base64," + base64.b64encode(_TINY_JPEG).decode()

PROPERTY_PAYLOAD = {
    "title": "Departamento en Polanco",
    "propertyType": "departamento",
    "operationType": "renta",
    "description": "Bonito depa cerca del parque.",
    "price": 15000,
    "currency": "MXN",
    "pricePeriod": "monthly",
    "maintenanceIncluded": True,
    "depositText": "2 meses de depósito",
    "minimumContractText": "Contrato mínimo de 12 meses",
    "availableFrom": "Inmediata",
    "bedrooms": 2,
    "bathrooms": 1,
    "parkingSpaces": 1,
    "furnished": True,
    "petsAllowed": False,
    "servicesIncluded": ["Agua"],
    "amenities": ["Gimnasio", "Roof garden"],
    "requirements": ["Buró de crédito", "Aval"],
    "location": {
        "country": "México",
        "state": "CDMX",
        "city": "CDMX",
        "neighborhood": "Polanco",
        "address": "Av. Horacio 123",
        "references": "Frente al parque Lincoln",
        "showExactAddress": False,
        "nearbyPlaces": [
            {"id": "np-1", "name": "Oxxo", "type": "tienda", "distanceText": "a 2 min"}
        ],
    },
    "contact": {"name": "María García", "whatsapp": "5512345678"},
    "photos": [],
}


@pytest.mark.asyncio
async def test_create_property(client: AsyncClient) -> None:
    response = await client.post("/api/properties", json=PROPERTY_PAYLOAD)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "draft"
    assert data["slug"] == ""
    assert data["title"] == PROPERTY_PAYLOAD["title"]
    assert data["location"]["neighborhood"] == "Polanco"
    assert data["location"]["nearbyPlaces"][0]["name"] == "Oxxo"
    assert data["contact"]["whatsapp"] == "5512345678"
    assert isinstance(data["price"], int | float)


@pytest.mark.asyncio
async def test_publish_property(client: AsyncClient) -> None:
    create_resp = await client.post("/api/properties", json=PROPERTY_PAYLOAD)
    prop_id = create_resp.json()["id"]

    pub_resp = await client.patch(f"/api/properties/{prop_id}/publish")
    assert pub_resp.status_code == 200
    data = pub_resp.json()
    assert data["status"] == "published"
    assert "polanco" in data["slug"]
    assert data["publishedAt"] is not None


@pytest.mark.asyncio
async def test_publish_requires_minimum_fields(client: AsyncClient) -> None:
    incomplete = {**PROPERTY_PAYLOAD, "price": 0, "contact": {"name": "", "whatsapp": "123"}}
    create_resp = await client.post("/api/properties", json=incomplete)
    prop_id = create_resp.json()["id"]

    pub_resp = await client.patch(f"/api/properties/{prop_id}/publish")
    assert pub_resp.status_code == 422
    assert "precio" in pub_resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_get_property_by_slug(client: AsyncClient) -> None:
    create_resp = await client.post("/api/properties", json=PROPERTY_PAYLOAD)
    prop_id = create_resp.json()["id"]
    pub_resp = await client.patch(f"/api/properties/{prop_id}/publish")
    slug = pub_resp.json()["slug"]

    get_resp = await client.get(f"/api/properties/slug/{slug}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == prop_id


@pytest.mark.asyncio
async def test_unpublished_property_still_returned_by_slug(client: AsyncClient) -> None:
    # El frontend distingue "no existe" de "publicación no activa";
    # el endpoint por slug devuelve la propiedad sin filtrar por status.
    create_resp = await client.post("/api/properties", json=PROPERTY_PAYLOAD)
    prop_id = create_resp.json()["id"]
    pub_resp = await client.patch(f"/api/properties/{prop_id}/publish")
    slug = pub_resp.json()["slug"]
    await client.patch(f"/api/properties/{prop_id}/unpublish")

    get_resp = await client.get(f"/api/properties/slug/{slug}")
    assert get_resp.status_code == 200
    assert get_resp.json()["status"] == "unpublished"


@pytest.mark.asyncio
async def test_update_property_full_document(client: AsyncClient) -> None:
    create_resp = await client.post("/api/properties", json=PROPERTY_PAYLOAD)
    prop_id = create_resp.json()["id"]

    updated = {**PROPERTY_PAYLOAD, "price": 18000, "bedrooms": 3}
    update_resp = await client.put(f"/api/properties/{prop_id}", json=updated)
    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["price"] == 18000
    assert data["bedrooms"] == 3


@pytest.mark.asyncio
async def test_photos_data_url_stored_and_synced(client: AsyncClient, tmp_path, monkeypatch) -> None:
    from app.core import config

    monkeypatch.setattr(config.settings, "STORAGE_LOCAL_DIR", str(tmp_path))

    payload = {
        **PROPERTY_PAYLOAD,
        "photos": [
            {"id": "ph-1", "url": TINY_JPEG_DATA_URL, "title": "Sala", "alt": "Sala", "isCover": True, "order": 0},
            {"id": "ph-2", "url": TINY_JPEG_DATA_URL, "title": "Cocina", "alt": "Cocina", "isCover": False, "order": 1},
        ],
    }
    create_resp = await client.post("/api/properties", json=payload)
    assert create_resp.status_code == 201
    photos = create_resp.json()["photos"]
    assert len(photos) == 2
    assert photos[0]["isCover"] is True
    assert photos[0]["title"] == "Sala"
    assert all(photo["url"].startswith("http") for photo in photos)

    # Sync: dejar solo la segunda foto (ya con url http)
    prop_id = create_resp.json()["id"]
    update_resp = await client.put(
        f"/api/properties/{prop_id}", json={**payload, "photos": [photos[1]]}
    )
    remaining = update_resp.json()["photos"]
    assert len(remaining) == 1
    assert remaining[0]["title"] == "Cocina"
    assert remaining[0]["isCover"] is True


@pytest.mark.asyncio
async def test_delete_property(client: AsyncClient) -> None:
    create_resp = await client.post("/api/properties", json=PROPERTY_PAYLOAD)
    prop_id = create_resp.json()["id"]

    delete_resp = await client.delete(f"/api/properties/{prop_id}")
    assert delete_resp.status_code == 204

    get_resp = await client.get(f"/api/properties/{prop_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_slug_uniqueness(client: AsyncClient) -> None:
    r1 = await client.post("/api/properties", json=PROPERTY_PAYLOAD)
    r2 = await client.post("/api/properties", json=PROPERTY_PAYLOAD)
    id1, id2 = r1.json()["id"], r2.json()["id"]

    p1 = await client.patch(f"/api/properties/{id1}/publish")
    p2 = await client.patch(f"/api/properties/{id2}/publish")
    assert p1.json()["slug"] != p2.json()["slug"]


@pytest.mark.asyncio
async def test_list_properties(client: AsyncClient) -> None:
    await client.post("/api/properties", json=PROPERTY_PAYLOAD)
    response = await client.get("/api/properties")
    assert response.status_code == 200
    assert len(response.json()) >= 1
