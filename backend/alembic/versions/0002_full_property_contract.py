"""full property contract: operación, ubicación completa, contacto y fotos con título

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-08 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # --- Nuevas columnas en properties ---
    op.add_column("properties", sa.Column("operation_type", sa.String(50), nullable=False, server_default="renta"))
    op.add_column("properties", sa.Column("price_period", sa.String(20), nullable=False, server_default="monthly"))
    op.add_column("properties", sa.Column("deposit_text", sa.String(255), nullable=False, server_default=""))
    op.add_column("properties", sa.Column("minimum_contract_text", sa.String(255), nullable=False, server_default=""))
    op.add_column("properties", sa.Column("services_included", postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column("properties", sa.Column("location_country", sa.String(100), nullable=False, server_default="México"))
    op.add_column("properties", sa.Column("location_state", sa.String(100), nullable=False, server_default=""))
    op.add_column("properties", sa.Column("location_city", sa.String(100), nullable=False, server_default=""))
    op.add_column("properties", sa.Column("location_neighborhood", sa.String(255), nullable=False, server_default=""))
    op.add_column("properties", sa.Column("location_address", sa.String(500), nullable=False, server_default=""))
    op.add_column("properties", sa.Column("location_references", sa.Text(), nullable=False, server_default=""))
    op.add_column("properties", sa.Column("location_lat", sa.Float(), nullable=True))
    op.add_column("properties", sa.Column("location_lng", sa.Float(), nullable=True))
    op.add_column("properties", sa.Column("show_exact_address", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("properties", sa.Column("nearby_places", postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column("properties", sa.Column("contact_whatsapp", sa.String(30), nullable=False, server_default=""))
    op.add_column("properties", sa.Column("contact_email", sa.String(255), nullable=True))

    # --- Migración de datos existentes ---
    op.execute("UPDATE properties SET location_city = city, location_neighborhood = zone, contact_whatsapp = whatsapp")
    op.execute(
        "UPDATE properties SET deposit_text = deposit_months || CASE WHEN deposit_months = 1 "
        "THEN ' mes de depósito' ELSE ' meses de depósito' END WHERE deposit_months > 0"
    )
    op.execute(
        "UPDATE properties SET minimum_contract_text = 'Contrato mínimo de ' || minimum_stay_months || ' meses' "
        "WHERE minimum_stay_months IS NOT NULL"
    )
    op.execute("UPDATE properties SET status = 'unpublished' WHERE status IN ('archived', 'rented')")
    op.execute("UPDATE properties SET description = '' WHERE description IS NULL")

    # --- Ajustes de columnas existentes ---
    op.alter_column("properties", "description", existing_type=sa.Text(), nullable=False, server_default="")
    op.alter_column("properties", "available_from", existing_type=sa.String(20), type_=sa.String(100), server_default="")
    op.alter_column("properties", "parking_spots", new_column_name="parking_spaces")

    # --- Columnas reemplazadas ---
    op.drop_column("properties", "zone")
    op.drop_column("properties", "city")
    op.drop_column("properties", "whatsapp")
    op.drop_column("properties", "deposit_months")
    op.drop_column("properties", "minimum_stay_months")

    # --- Fotos: título por foto y urls largas (data urls migradas a storage) ---
    op.add_column("property_images", sa.Column("title", sa.String(255), nullable=False, server_default=""))
    op.alter_column("property_images", "url", existing_type=sa.String(1024), type_=sa.Text())


def downgrade() -> None:
    op.alter_column("property_images", "url", existing_type=sa.Text(), type_=sa.String(1024))
    op.drop_column("property_images", "title")

    op.add_column("properties", sa.Column("minimum_stay_months", sa.Integer(), nullable=True))
    op.add_column("properties", sa.Column("deposit_months", sa.Integer(), nullable=False, server_default="1"))
    op.add_column("properties", sa.Column("whatsapp", sa.String(30), nullable=False, server_default=""))
    op.add_column("properties", sa.Column("city", sa.String(255), nullable=False, server_default=""))
    op.add_column("properties", sa.Column("zone", sa.String(255), nullable=False, server_default=""))
    op.execute("UPDATE properties SET city = location_city, zone = location_neighborhood, whatsapp = contact_whatsapp")

    op.alter_column("properties", "parking_spaces", new_column_name="parking_spots")
    op.alter_column("properties", "available_from", existing_type=sa.String(100), type_=sa.String(20))
    op.alter_column("properties", "description", existing_type=sa.Text(), nullable=True)

    for column in (
        "contact_email",
        "contact_whatsapp",
        "nearby_places",
        "show_exact_address",
        "location_lng",
        "location_lat",
        "location_references",
        "location_address",
        "location_neighborhood",
        "location_city",
        "location_state",
        "location_country",
        "services_included",
        "minimum_contract_text",
        "deposit_text",
        "price_period",
        "operation_type",
    ):
        op.drop_column("properties", column)
