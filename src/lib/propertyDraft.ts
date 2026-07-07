import type { Property } from '../types/property';
import { createEmptyProperty } from '../types/property';

export const PROPERTY_DRAFT_STORAGE_KEY = 'entaltek-rentas:property-draft-v2';

export function safeNumber(value: string, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function listFromText(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function textFromList(value: string[]): string {
  return value.join('\n');
}

export function loadPropertyDraft(): Property {
  const empty = createEmptyProperty();

  try {
    const stored = window.localStorage.getItem(PROPERTY_DRAFT_STORAGE_KEY);
    if (!stored) return empty;

    const parsed = JSON.parse(stored) as Partial<Property>;
    if (!parsed || typeof parsed !== 'object' || !parsed.location || !parsed.contact) {
      return empty;
    }

    return {
      ...empty,
      ...parsed,
      location: { ...empty.location, ...parsed.location },
      contact: { ...empty.contact, ...parsed.contact },
      photos: Array.isArray(parsed.photos) ? parsed.photos : [],
      servicesIncluded: Array.isArray(parsed.servicesIncluded) ? parsed.servicesIncluded : [],
      amenities: Array.isArray(parsed.amenities) ? parsed.amenities : [],
      requirements: Array.isArray(parsed.requirements) ? parsed.requirements : []
    };
  } catch {
    return empty;
  }
}

export function savePropertyDraft(property: Property): void {
  try {
    window.localStorage.setItem(PROPERTY_DRAFT_STORAGE_KEY, JSON.stringify(property));
  } catch {
    // El borrador es una conveniencia; si no cabe (fotos muy pesadas) no rompemos la edición.
  }
}

export function clearPropertyDraft(): void {
  window.localStorage.removeItem(PROPERTY_DRAFT_STORAGE_KEY);
}
