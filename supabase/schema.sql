-- Entaltek Rentas — Supabase MVP schema
-- Ejecutar en Supabase Dashboard → SQL Editor.
-- Este esquema guarda el modelo completo de la app en JSONB para acelerar el MVP,
-- y duplica columnas clave para buscar por slug, status y ordenar por fechas.

create table if not exists public.properties (
  id text primary key,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published', 'unpublished')),
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  expires_at timestamptz
);

create index if not exists properties_status_idx on public.properties (status);
create index if not exists properties_updated_at_idx on public.properties (updated_at desc);
create index if not exists properties_published_at_idx on public.properties (published_at desc);

alter table public.properties enable row level security;

-- Lectura pública: la landing /r/:slug necesita leer propiedades publicadas.
drop policy if exists "Public can read published properties" on public.properties;
create policy "Public can read published properties"
on public.properties
for select
using (status = 'published');

-- Escritura pública temporal para MVP sin auth.
-- IMPORTANTE: esto permite que cualquier visitante cree/edite/despublique publicaciones
-- si conoce la API del frontend. Úsalo solo para validar el producto.
-- Para producción real, reemplazar por Supabase Auth y políticas por owner_id.
drop policy if exists "MVP public can create properties" on public.properties;
create policy "MVP public can create properties"
on public.properties
for insert
with check (true);

drop policy if exists "MVP public can update properties" on public.properties;
create policy "MVP public can update properties"
on public.properties
for update
using (true)
with check (true);

drop policy if exists "MVP public can delete properties" on public.properties;
create policy "MVP public can delete properties"
on public.properties
for delete
using (true);

-- Bucket sugerido para fotos:
-- 1. Supabase Dashboard → Storage → New bucket
-- 2. Nombre: property-images
-- 3. Para MVP: public bucket
--
-- Nota: el código actual todavía guarda las fotos dentro del objeto Property.
-- El siguiente paso técnico es mover la subida de imágenes al bucket y guardar URLs.
