import type { Property } from '../types/property';
import { generateId, generatePropertySlug } from '../lib/slug';

// Repositorio local basado en localStorage. Implementa el mismo contrato que
// la API remota para que el resto de la app no dependa de dónde se guardan
// los datos; cambiar a una base de datos real solo requiere otro adaptador.
const STORAGE_KEY = 'entaltek-rentas:properties';

function readStore(): Property[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Property[]) : [];
  } catch {
    return [];
  }
}

function writeStore(properties: Property[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
  } catch {
    throw new Error(
      'No se pudo guardar en este navegador. Es posible que las fotos ocupen demasiado espacio; intenta con menos fotos o de menor tamaño.'
    );
  }
}

export async function listProperties(): Promise<Property[]> {
  return readStore().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getPropertyById(id: string): Promise<Property | null> {
  return readStore().find((property) => property.id === id) ?? null;
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  return readStore().find((property) => property.slug === slug) ?? null;
}

export async function saveProperty(property: Property): Promise<Property> {
  const store = readStore();
  const now = new Date().toISOString();
  const existingIndex = property.id ? store.findIndex((item) => item.id === property.id) : -1;

  if (existingIndex >= 0) {
    const updated: Property = { ...property, updatedAt: now };
    store[existingIndex] = updated;
    writeStore(store);
    return updated;
  }

  const created: Property = {
    ...property,
    id: generateId(),
    slug: property.slug || generatePropertySlug(property.title, property.location.city),
    status: 'draft',
    createdAt: now,
    updatedAt: now
  };
  store.push(created);
  writeStore(store);
  return created;
}

export async function publishProperty(id: string): Promise<Property> {
  return updateStatus(id, 'published');
}

export async function unpublishProperty(id: string): Promise<Property> {
  return updateStatus(id, 'unpublished');
}

export async function deleteProperty(id: string): Promise<void> {
  writeStore(readStore().filter((property) => property.id !== id));
}

async function updateStatus(id: string, status: 'published' | 'unpublished'): Promise<Property> {
  const store = readStore();
  const index = store.findIndex((property) => property.id === id);

  if (index < 0) {
    throw new Error('La propiedad no existe. Guárdala antes de publicarla.');
  }

  const now = new Date().toISOString();
  const current = store[index];
  const updated: Property = {
    ...current,
    status,
    updatedAt: now,
    publishedAt: status === 'published' ? current.publishedAt ?? now : current.publishedAt,
    slug: current.slug || generatePropertySlug(current.title, current.location.city)
  };
  store[index] = updated;
  writeStore(store);
  return updated;
}
