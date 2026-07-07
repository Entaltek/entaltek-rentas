import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.lead import LeadCreate, LeadOut, LeadStatusUpdate
from app.services import lead_service

router = APIRouter(tags=["leads"])


@router.post("/leads", response_model=LeadOut, status_code=201)
async def create_lead(
    payload: LeadCreate,
    db: AsyncSession = Depends(get_db),
) -> LeadOut:
    lead = await lead_service.create_lead(db, payload)
    return LeadOut.model_validate(lead)


@router.get("/properties/{property_id}/leads", response_model=list[LeadOut])
async def list_leads(
    property_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[LeadOut]:
    leads = await lead_service.list_leads(db, property_id)
    return [LeadOut.model_validate(lead) for lead in leads]


@router.patch("/leads/{lead_id}/status", response_model=LeadOut)
async def update_lead_status(
    lead_id: uuid.UUID,
    payload: LeadStatusUpdate,
    db: AsyncSession = Depends(get_db),
) -> LeadOut:
    lead = await lead_service.update_lead_status(db, lead_id, payload.status)
    return LeadOut.model_validate(lead)
