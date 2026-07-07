import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field

from app.models.lead import LeadStatus


class LeadCreate(BaseModel):
    property_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=7, max_length=30)
    email: EmailStr | None = None
    move_in_date: str | None = Field(None, max_length=20)
    budget: Decimal | None = Field(None, gt=0, decimal_places=2)
    has_pets: bool | None = None
    has_guarantor: bool | None = None
    message: str | None = Field(None, max_length=2000)


class LeadStatusUpdate(BaseModel):
    status: LeadStatus


class LeadOut(BaseModel):
    id: uuid.UUID
    property_id: uuid.UUID
    name: str
    phone: str
    email: str | None
    move_in_date: str | None
    budget: Decimal | None
    has_pets: bool | None
    has_guarantor: bool | None
    message: str | None
    status: LeadStatus
    created_at: datetime

    model_config = {"from_attributes": True}
