import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { generateId, generatePropertySlug } from '../lib/slug';
import type { Property, PropertyStatus } from '../types/property';

const TABLE_NAME = 'properties';
const PUBLICATION_DURATION_DAYS = 30;

type PropertyRow = {
  id: string;
  slug: string;
  status: PropertyStatus;
  data: Property;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  expires_at: string | null;
};

export { isSupabaseConfigured };

function fromRow(row: PropertyRow): Property {
  return {
    ...row.data,
    id: row.id,
    slug: row.slug,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? undefined,
    expiresAt: row.expires_at ?? undefined
  };
}

function toRow(property: Property): Omit<PropertyRow, 'data'> & { data: Property } {
  return {
    id: property.id,
    slug: property.slug,
    status: property.status,
    created_at: property.createdAt,
    updated_at: property.updatedAt,
    published_at: property.publishedAt ?? null,
    expires_at: property.expiresAt ?? null,
    data: property
  };
}

function getExpirationDate(fromIso: string): string {
  const date = new Date(fromIso);
  date.setDate(date.getDate() + PUBLICATION_DURATION_DAYS);
  return date.toISOString();
}

function withSafeIdentity(property: Property): Property {
  const id = property.id || generateId();
  const slug = property.slug || generatePropertySlug(property.title, property.location.city);
  return { ...property, id, slug };
}

function normalizeForSave(property: Property, existing?: Property | null): Property {
  const now = new Date().toISOString();
  const withIdentity = withSafeIdentity(property);

  return {
    ...withIdentity,
    status: withIdentity.status || existing?.status || 'draft',
    createdAt: existing?.createdAt || withIdentity.createdAt || now,
    updatedAt: now,
    publishedAt: existing?.publishedAt ?? withIdentity.publishedAt,
    expiresAt: existing?.expiresAt ?? withIdentity.expiresAt
  };
}

function normalizeForStatus(property: Property, status: 'published' | 'unpublished'): Property {
  const now = new Date().toISOString();
  const publishedAt = status === 'published' ? now : property.publishedAt;

  return {
    ...withSafeIdentity(property),
    status,
    updatedAt: now,
    publishedAt,
    expiresAt: status === 'published' ? getExpirationDate(now) : property.expiresAt
  };
}

function readableSupabaseError(message: string): Error {
  if (message.includes('duplicate key') || message.includes('properties_slug_key')) {
    return new Error('Ya existe una publicación con ese slug. Cambia el título o guarda de nuevo para generar otro link.');
  }

  return new Error(message || 'No se pudo completar la operación en Supabase.');
}

export async function listProperties(): Promise<Property[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw readableSupabaseError(error.message);
  return ((data ?? []) as PropertyRow[]).map(fromRow);
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw readableSupabaseError(error.message);
  return data ? fromRow(data as PropertyRow) : null;
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw readableSupabaseError(error.message);
  return data ? fromRow(data as PropertyRow) : null;
}

export async function saveProperty(property: Property): Promise<Property> {
  const existing = property.id ? await getPropertyById(property.id) : null;
  const normalized = normalizeForSave(property, existing);
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .upsert(toRow(normalized), { onConflict: 'id' })
    .select('*')
    .single();

  if (error) throw readableSupabaseError(error.message);
  return fromRow(data as PropertyRow);
}

export async function publishProperty(id: string): Promise<Property> {
  return updateStatus(id, 'published');
}

export async function unpublishProperty(id: string): Promise<Property> {
  return updateStatus(id, 'unpublished');
}

export async function deleteProperty(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
  if (error) throw readableSupabaseError(error.message);
}

async function updateStatus(id: string, status: 'published' | 'unpublished'): Promise<Property> {
  const current = await getPropertyById(id);

  if (!current) {
    throw new Error('La propiedad no existe. Guárdala antes de publicarla.');
  }

  const updated = normalizeForStatus(current, status);
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(toRow(updated))
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw readableSupabaseError(error.message);
  return fromRow(data as PropertyRow);
}
