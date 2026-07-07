import pytest
from httpx import AsyncClient

PROPERTY_PAYLOAD = {
    "title": "Casa en Roma",
    "property_type": "casa",
    "price": "22000.00",
    "currency": "MXN",
    "zone": "Roma Norte",
    "city": "CDMX",
    "bedrooms": 3,
    "bathrooms": 2,
    "parking_spots": 0,
    "furnished": False,
    "pets_allowed": True,
    "maintenance_included": False,
    "deposit_months": 2,
    "available_from": "2024-03-01",
    "contact_name": "Juan Pérez",
    "whatsapp": "5598765432",
}

LEAD_PAYLOAD_TEMPLATE = {
    "name": "Ana López",
    "phone": "5511223344",
    "email": "ana@example.com",
    "has_pets": False,
    "has_guarantor": True,
    "message": "Me interesa mucho.",
}


@pytest.mark.asyncio
async def test_create_lead_on_published_property(client: AsyncClient) -> None:
    cr = await client.post("/api/v1/properties", json=PROPERTY_PAYLOAD)
    prop_id = cr.json()["id"]
    await client.post(f"/api/v1/properties/{prop_id}/publish")

    lead_resp = await client.post(
        "/api/v1/leads", json={**LEAD_PAYLOAD_TEMPLATE, "property_id": prop_id}
    )
    assert lead_resp.status_code == 201
    data = lead_resp.json()
    assert data["status"] == "new"
    assert data["name"] == "Ana López"


@pytest.mark.asyncio
async def test_create_lead_on_draft_property_returns_404(client: AsyncClient) -> None:
    cr = await client.post("/api/v1/properties", json=PROPERTY_PAYLOAD)
    prop_id = cr.json()["id"]

    response = await client.post(
        "/api/v1/leads", json={**LEAD_PAYLOAD_TEMPLATE, "property_id": prop_id}
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_leads(client: AsyncClient) -> None:
    cr = await client.post("/api/v1/properties", json=PROPERTY_PAYLOAD)
    prop_id = cr.json()["id"]
    await client.post(f"/api/v1/properties/{prop_id}/publish")

    for _ in range(3):
        await client.post("/api/v1/leads", json={**LEAD_PAYLOAD_TEMPLATE, "property_id": prop_id})

    resp = await client.get(f"/api/v1/properties/{prop_id}/leads")
    assert resp.status_code == 200
    assert len(resp.json()) >= 3


@pytest.mark.asyncio
async def test_update_lead_status(client: AsyncClient) -> None:
    cr = await client.post("/api/v1/properties", json=PROPERTY_PAYLOAD)
    prop_id = cr.json()["id"]
    await client.post(f"/api/v1/properties/{prop_id}/publish")

    lead_resp = await client.post(
        "/api/v1/leads", json={**LEAD_PAYLOAD_TEMPLATE, "property_id": prop_id}
    )
    lead_id = lead_resp.json()["id"]

    update_resp = await client.patch(
        f"/api/v1/leads/{lead_id}/status", json={"status": "contacted"}
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "contacted"
