import type { Property } from '../types/property';

export const PROPERTY_DRAFT_STORAGE_KEY = 'entaltek-rentas:property-draft';

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

export function loadPropertyDraft(fallback: Property): Property {
  try {
    const stored = window.localStorage.getItem(PROPERTY_DRAFT_STORAGE_KEY);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored) as Property;
    return {
      ...fallback,
      ...parsed,
      images: parsed.images?.length ? parsed.images : fallback.images,
      requirements: parsed.requirements?.length ? parsed.requirements : fallback.requirements,
      amenities: parsed.amenities?.length ? parsed.amenities : fallback.amenities
    };
  } catch {
    return fallback;
  }
}

export function savePropertyDraft(property: Property): void {
  window.localStorage.setItem(PROPERTY_DRAFT_STORAGE_KEY, JSON.stringify(property));
}

export function clearPropertyDraft(): void {
  window.localStorage.removeItem(PROPERTY_DRAFT_STORAGE_KEY);
}
