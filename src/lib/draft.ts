import type { Property, PropertyType } from '../types/property';

const STORAGE_KEY = 'entaltek-rentas:draft-v1';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop';

export interface PropertyDraft {
  title: string;
  type: PropertyType;
  price: string;
  zone: string;
  city: string;
  bedrooms: string;
  bathrooms: string;
  parkingSpots: string;
  areaM2: string;
  depositMonths: string;
  availableFrom: string;
  whatsapp: string;
  description: string;
  requirements: string;
  amenities: string;
  imageUrls: string;
  furnished: boolean;
  petsAllowed: boolean;
  maintenanceIncluded: boolean;
}

export const emptyDraft: PropertyDraft = {
  title: '',
  type: 'departamento',
  price: '',
  zone: '',
  city: '',
  bedrooms: '2',
  bathrooms: '1',
  parkingSpots: '1',
  areaM2: '',
  depositMonths: '1',
  availableFrom: 'Inmediata',
  whatsapp: '',
  description: '',
  requirements: 'Identificación oficial\nComprobante de ingresos\nUn mes de depósito',
  amenities: '',
  imageUrls: '',
  furnished: false,
  petsAllowed: false,
  maintenanceIncluded: false
};

function parseCount(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function normalizeWhatsapp(value: string): string {
  return value.replace(/\D/g, '');
}

export function isDraftPresentable(draft: PropertyDraft): boolean {
  return draft.title.trim().length > 0 && parseCount(draft.price, 0) > 0;
}

export function draftToProperty(draft: PropertyDraft): Property {
  const images = splitLines(draft.imageUrls);
  return {
    id: 'draft',
    slug: 'borrador',
    title: draft.title.trim(),
    type: draft.type,
    price: parseCount(draft.price, 0),
    currency: 'MXN',
    zone: draft.zone.trim() || 'Zona por confirmar',
    city: draft.city.trim() || 'Ciudad por confirmar',
    bedrooms: parseCount(draft.bedrooms, 1),
    bathrooms: parseCount(draft.bathrooms, 1),
    parkingSpots: parseCount(draft.parkingSpots, 0),
    areaM2: draft.areaM2 ? parseCount(draft.areaM2, 0) || undefined : undefined,
    furnished: draft.furnished,
    petsAllowed: draft.petsAllowed,
    maintenanceIncluded: draft.maintenanceIncluded,
    depositMonths: parseCount(draft.depositMonths, 1),
    availableFrom: draft.availableFrom.trim() || 'Inmediata',
    description: draft.description.trim() || 'Descripción pendiente.',
    requirements: splitLines(draft.requirements),
    amenities: splitLines(draft.amenities),
    images: images.length > 0 ? images : [FALLBACK_IMAGE],
    contactName: 'Anunciante',
    whatsapp: normalizeWhatsapp(draft.whatsapp),
    createdAt: new Date().toISOString()
  };
}

export function loadDraft(): PropertyDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PropertyDraft>;
    return { ...emptyDraft, ...parsed };
  } catch {
    return null;
  }
}

export function saveDraft(draft: PropertyDraft): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // almacenamiento no disponible (modo privado); el borrador vive solo en memoria
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // sin almacenamiento no hay nada que limpiar
  }
}
