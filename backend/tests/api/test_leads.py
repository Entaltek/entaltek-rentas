import pytest
from httpx import AsyncClient

PROPERTY_PAYLOAD = {
    "title": "Casa en Roma",
    "propertyType": "casa",
    "operationType": "renta",
    "description": "Casa amplia en Roma Norte.",
    "price": 22000,
    "currency": "MXN",
    "pricePeriod": "monthly",
    "bedrooms": 3,
    "bathrooms": 2,
    "parkingSpaces": 0,
    "furnished": False,
    "petsAllowed": True,
    "availableFrom": "2026-08-01",
    "location": {
        "state": "CDMX",
        "city": "CDMX",
        "neighborhood": "Roma Norte",
        "showExactAddress": False,
        "nearbyPlaces": [],
    },
    "contact": {"name": "Juan Pérez", "whatsapp": "5598765432"},
    "photos": [],
}

LEAD_PAYLOAD_TEMPLATE = {
    "name": "Ana López",
    "phone": "5511223344",
    "email": "ana@example.com",
    "has_pets": False,
    "has_guarantor": True,
    "message": "Me interesa mucho.",
}


async def _create_published_property(client: AsyncClient) -> str:
    create_resp = await client.post("/api/properties", json=PROPERTY_PAYLOAD)
    prop_id = create_resp.json()["id"]
    pub_resp = await client.patch(f"/api/properties/{prop_id}/publish")
    assert pub_resp.status_code == 200
    return prop_id


@pytest.mark.asyncio
async def test_create_lead_on_published_property(client: AsyncClient) -> None:
    prop_id = await _create_published_property(client)

    lead_resp = await client.post(
        "/api/leads", json={**LEAD_PAYLOAD_TEMPLATE, "property_id": prop_id}
    )
    assert lead_resp.status_code == 201
    data = lead_resp.json()
    assert data["status"] == "new"
    assert data["name"] == "Ana López"


@pytest.mark.asyncio
async def test_create_lead_on_draft_property_returns_404(client: AsyncClient) -> None:
    create_resp = await client.post("/api/properties", json=PROPERTY_PAYLOAD)
    prop_id = create_resp.json()["id"]

    response = await client.post(
        "/api/leads", json={**LEAD_PAYLOAD_TEMPLATE, "property_id": prop_id}
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_leads(client: AsyncClient) -> None:
    prop_id = await _create_published_property(client)

    for _ in range(3):
        await client.post("/api/leads", json={**LEAD_PAYLOAD_TEMPLATE, "property_id": prop_id})

    resp = await client.get(f"/api/properties/{prop_id}/leads")
    assert resp.status_code == 200
    assert len(resp.json()) >= 3


@pytest.mark.asyncio
async def test_update_lead_status(client: AsyncClient) -> None:
    prop_id = await _create_published_property(client)

    lead_resp = await client.post(
        "/api/leads", json={**LEAD_PAYLOAD_TEMPLATE, "property_id": prop_id}
    )
    lead_id = lead_resp.json()["id"]

    update_resp = await client.patch(f"/api/leads/{lead_id}/status", json={"status": "contacted"})
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "contacted"
