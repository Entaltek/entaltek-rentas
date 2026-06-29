import pytest
from httpx import AsyncClient

PROPERTY_PAYLOAD = {
    "title": "Departamento en Polanco",
    "property_type": "departamento",
    "price": "15000.00",
    "currency": "MXN",
    "zone": "Polanco",
    "city": "CDMX",
    "bedrooms": 2,
    "bathrooms": 1,
    "parking_spots": 1,
    "furnished": True,
    "pets_allowed": False,
    "maintenance_included": True,
    "deposit_months": 2,
    "available_from": "2024-02-01",
    "description": "Bonito depa cerca del parque.",
    "requirements": ["Buro de crédito", "Aval"],
    "amenities": ["Gimnasio", "Roof garden"],
    "contact_name": "María García",
    "whatsapp": "5512345678",
}


@pytest.mark.asyncio
async def test_create_property(client: AsyncClient) -> None:
    response = await client.post("/api/v1/properties", json=PROPERTY_PAYLOAD)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "draft"
    assert data["slug"] is None
    assert data["title"] == PROPERTY_PAYLOAD["title"]


@pytest.mark.asyncio
async def test_publish_property(client: AsyncClient) -> None:
    create_resp = await client.post("/api/v1/properties", json=PROPERTY_PAYLOAD)
    prop_id = create_resp.json()["id"]

    pub_resp = await client.post(f"/api/v1/properties/{prop_id}/publish")
    assert pub_resp.status_code == 200
    data = pub_resp.json()
    assert data["status"] == "published"
    assert data["slug"] is not None
    assert "polanco" in data["slug"]


@pytest.mark.asyncio
async def test_get_property_by_slug(client: AsyncClient) -> None:
    create_resp = await client.post("/api/v1/properties", json=PROPERTY_PAYLOAD)
    prop_id = create_resp.json()["id"]
    pub_resp = await client.post(f"/api/v1/properties/{prop_id}/publish")
    slug = pub_resp.json()["slug"]

    get_resp = await client.get(f"/api/v1/properties/{slug}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == prop_id


@pytest.mark.asyncio
async def test_get_draft_property_by_slug_returns_404(client: AsyncClient) -> None:
    create_resp = await client.post("/api/v1/properties", json=PROPERTY_PAYLOAD)
    prop_id = create_resp.json()["id"]
    response = await client.get(f"/api/v1/properties/{prop_id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_property(client: AsyncClient) -> None:
    create_resp = await client.post("/api/v1/properties", json=PROPERTY_PAYLOAD)
    prop_id = create_resp.json()["id"]

    update_resp = await client.patch(
        f"/api/v1/properties/{prop_id}", json={"price": "18000.00", "bedrooms": 3}
    )
    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["price"] == "18000.00"
    assert data["bedrooms"] == 3


@pytest.mark.asyncio
async def test_archive_property(client: AsyncClient) -> None:
    create_resp = await client.post("/api/v1/properties", json=PROPERTY_PAYLOAD)
    prop_id = create_resp.json()["id"]

    archive_resp = await client.post(f"/api/v1/properties/{prop_id}/archive")
    assert archive_resp.status_code == 200
    assert archive_resp.json()["status"] == "archived"


@pytest.mark.asyncio
async def test_slug_uniqueness(client: AsyncClient) -> None:
    r1 = await client.post("/api/v1/properties", json=PROPERTY_PAYLOAD)
    r2 = await client.post("/api/v1/properties", json=PROPERTY_PAYLOAD)
    id1, id2 = r1.json()["id"], r2.json()["id"]

    p1 = await client.post(f"/api/v1/properties/{id1}/publish")
    p2 = await client.post(f"/api/v1/properties/{id2}/publish")
    slug1, slug2 = p1.json()["slug"], p2.json()["slug"]
    assert slug1 != slug2


@pytest.mark.asyncio
async def test_create_property_missing_required_fields(client: AsyncClient) -> None:
    response = await client.post("/api/v1/properties", json={"title": "Solo título"})
    assert response.status_code == 422
