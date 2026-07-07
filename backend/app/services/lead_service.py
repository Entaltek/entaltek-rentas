import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.lead import Lead, LeadStatus
from app.models.property import Property, PropertyStatus
from app.schemas.lead import LeadCreate


async def create_lead(db: AsyncSession, payload: LeadCreate) -> Lead:
    result = await db.execute(
        select(Property).where(
            Property.id == payload.property_id,
            Property.status == PropertyStatus.published,
        )
    )
    if result.scalar_one_or_none() is None:
        raise NotFoundError("Property not found or not published.")

    lead = Lead(**payload.model_dump())
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead


async def list_leads(db: AsyncSession, property_id: uuid.UUID) -> list[Lead]:
    result = await db.execute(select(Lead).where(Lead.property_id == property_id))
    return list(result.scalars().all())


async def update_lead_status(db: AsyncSession, lead_id: uuid.UUID, status: LeadStatus) -> Lead:
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if lead is None:
        raise NotFoundError("Lead not found.")
    lead.status = status
    await db.commit()
    await db.refresh(lead)
    return lead
