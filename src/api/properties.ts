import type { Property, PropertyType } from '../types/property';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export interface ApiProperty {
  id: string;
  slug: string | null;
  title: string;
  property_type: PropertyType;
  price: string;
  currency: 'MXN';
  zone: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  parking_spots: number;
  area_m2?: number | null;
  furnished: boolean;
  pets_allowed: boolean;
  maintenance_included: boolean;
  deposit_months: number;
  minimum_stay_months?: number | null;
  available_from: string;
  description: string;
  requirements: string[];
  amenities: string[];
  contact_name: string;
  whatsapp: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at?: string;
  published_at?: string | null;
  images: Array<{ url?: string; image_url?: string; public_url?: string }>;
}

export interface CreatePropertyPayload {
  title: string;
  property_type: PropertyType;
  price: number;
  currency: 'MXN';
  zone: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  parking_spots: number;
  area_m2?: number;
  furnished: boolean;
  pets_allowed: boolean;
  maintenance_included: boolean;
  deposit_months: number;
  minimum_stay_months?: number;
  available_from: string;
  description: string;
  requirements: string[];
  amenities: string[];
  contact_name: string;
  whatsapp: string;
}

export function toCreatePropertyPayload(property: Property): CreatePropertyPayload {
  return {
    title: property.title,
    property_type: property.type,
    price: property.price,
    currency: property.currency,
    zone: property.zone,
    city: property.city,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    parking_spots: property.parkingSpots,
    area_m2: property.areaM2,
    furnished: property.furnished,
    pets_allowed: property.petsAllowed,
    maintenance_included: property.maintenanceIncluded,
    deposit_months: property.depositMonths,
    minimum_stay_months: property.minimumStayMonths,
    available_from: property.availableFrom,
    description: property.description,
    requirements: property.requirements,
    amenities: property.amenities,
    contact_name: property.contactName,
    whatsapp: property.whatsapp
  };
}

export function fromApiProperty(apiProperty: ApiProperty): Property {
  return {
    id: apiProperty.id,
    slug: apiProperty.slug ?? '',
    title: apiProperty.title,
    type: apiProperty.property_type,
    price: Number(apiProperty.price),
    currency: apiProperty.currency,
    zone: apiProperty.zone,
    city: apiProperty.city,
    bedrooms: apiProperty.bedrooms,
    bathrooms: apiProperty.bathrooms,
    parkingSpots: apiProperty.parking_spots,
    areaM2: apiProperty.area_m2 ?? undefined,
    furnished: apiProperty.furnished,
    petsAllowed: apiProperty.pets_allowed,
    maintenanceIncluded: apiProperty.maintenance_included,
    depositMonths: apiProperty.deposit_months,
    minimumStayMonths: apiProperty.minimum_stay_months ?? undefined,
    availableFrom: apiProperty.available_from,
    description: apiProperty.description,
    requirements: apiProperty.requirements,
    amenities: apiProperty.amenities,
    images: apiProperty.images.map((image) => image.url ?? image.image_url ?? image.public_url ?? '').filter(Boolean),
    contactName: apiProperty.contact_name,
    whatsapp: apiProperty.whatsapp,
    createdAt: apiProperty.created_at
  };
}

export async function createProperty(property: Property): Promise<Property> {
  const response = await fetch(`${API_BASE_URL}/api/v1/properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toCreatePropertyPayload(property))
  });

  return parsePropertyResponse(response);
}

export async function publishProperty(propertyId: string): Promise<Property> {
  const response = await fetch(`${API_BASE_URL}/api/v1/properties/${propertyId}/publish`, {
    method: 'POST'
  });

  return parsePropertyResponse(response);
}

export async function getPropertyBySlug(slug: string): Promise<Property> {
  const response = await fetch(`${API_BASE_URL}/api/v1/properties/${slug}`);

  return parsePropertyResponse(response);
}

async function parsePropertyResponse(response: Response): Promise<Property> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'No se pudo procesar la propiedad.');
  }

  const apiProperty = await response.json() as ApiProperty;
  return fromApiProperty(apiProperty);
}
