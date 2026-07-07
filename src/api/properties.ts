import type { Property, PropertyImageRef, PropertyStatus, PropertyType } from '../types/property';
import { apiFetch, resolveMediaUrl } from './client';

// --- Tipos alineados con backend/app/schemas/property.py ---

export interface ApiPropertyImage {
  id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
}

export interface ApiProperty {
  id: string;
  slug: string | null;
  title: string;
  property_type: string;
  /** Pydantic serializa Decimal como string en JSON. */
  price: string | number;
  currency: string;
  zone: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  parking_spots: number;
  area_m2: number | null;
  furnished: boolean;
  pets_allowed: boolean;
  maintenance_included: boolean;
  deposit_months: number;
  minimum_stay_months: number | null;
  available_from: string;
  description: string | null;
  requirements: string[] | null;
  amenities: string[] | null;
  contact_name: string;
  whatsapp: string;
  status: PropertyStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  images: ApiPropertyImage[];
}

export interface CreatePropertyPayload {
  title: string;
  property_type: string;
  price: number;
  currency: string;
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
  description?: string;
  requirements?: string[];
  amenities?: string[];
  contact_name: string;
  whatsapp: string;
}

export type UpdatePropertyPayload = Partial<CreatePropertyPayload>;

// --- Mapeo entre el modelo del frontend y los schemas del backend ---

export function toPropertyPayload(property: Property): CreatePropertyPayload {
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
    // El backend exige area_m2 > 0 cuando viene; 0 significa "sin capturar".
    area_m2: property.areaM2 || undefined,
    furnished: property.furnished,
    pets_allowed: property.petsAllowed,
    maintenance_included: property.maintenanceIncluded,
    deposit_months: property.depositMonths,
    minimum_stay_months: property.minimumStayMonths || undefined,
    available_from: property.availableFrom,
    description: property.description,
    requirements: property.requirements,
    amenities: property.amenities,
    contact_name: property.contactName,
    whatsapp: property.whatsapp
  };
}

function toImageRef(image: ApiPropertyImage): PropertyImageRef {
  return {
    id: image.id,
    url: resolveMediaUrl(image.url),
    isCover: image.is_cover,
    sortOrder: image.sort_order
  };
}

export function fromApiProperty(apiProperty: ApiProperty): Property {
  const imageRecords = [...apiProperty.images]
    .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)
    .map(toImageRef);

  return {
    id: apiProperty.id,
    slug: apiProperty.slug ?? '',
    title: apiProperty.title,
    type: apiProperty.property_type as PropertyType,
    price: Number(apiProperty.price),
    currency: apiProperty.currency as Property['currency'],
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
    description: apiProperty.description ?? '',
    requirements: apiProperty.requirements ?? [],
    amenities: apiProperty.amenities ?? [],
    images: imageRecords.map((image) => image.url),
    imageRecords,
    contactName: apiProperty.contact_name,
    whatsapp: apiProperty.whatsapp,
    status: apiProperty.status,
    createdAt: apiProperty.created_at
  };
}

// --- Endpoints ---

export async function createProperty(property: Property): Promise<Property> {
  const apiProperty = await apiFetch<ApiProperty>('/api/v1/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toPropertyPayload(property))
  });
  return fromApiProperty(apiProperty);
}

export async function updateProperty(propertyId: string, payload: UpdatePropertyPayload): Promise<Property> {
  const apiProperty = await apiFetch<ApiProperty>(`/api/v1/properties/${propertyId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return fromApiProperty(apiProperty);
}

export async function publishProperty(propertyId: string): Promise<Property> {
  const apiProperty = await apiFetch<ApiProperty>(`/api/v1/properties/${propertyId}/publish`, {
    method: 'POST'
  });
  return fromApiProperty(apiProperty);
}

export async function archiveProperty(propertyId: string): Promise<Property> {
  const apiProperty = await apiFetch<ApiProperty>(`/api/v1/properties/${propertyId}/archive`, {
    method: 'POST'
  });
  return fromApiProperty(apiProperty);
}

export async function getPropertyBySlug(slug: string): Promise<Property> {
  const apiProperty = await apiFetch<ApiProperty>(`/api/v1/properties/${encodeURIComponent(slug)}`);
  return fromApiProperty(apiProperty);
}

export async function uploadPropertyImages(propertyId: string, imageDataUrls: string[]): Promise<PropertyImageRef[]> {
  const uploadableImages = imageDataUrls.filter((image) => image.startsWith('data:image/'));

  if (!uploadableImages.length) {
    return [];
  }

  const formData = new FormData();
  uploadableImages.forEach((image, index) => {
    formData.append('files', dataUrlToFile(image, `property-image-${index + 1}`));
  });

  const images = await apiFetch<ApiPropertyImage[]>(`/api/v1/properties/${propertyId}/images`, {
    method: 'POST',
    body: formData
  });

  return images.map(toImageRef);
}

export async function deletePropertyImage(propertyId: string, imageId: string): Promise<void> {
  await apiFetch<void>(`/api/v1/properties/${propertyId}/images/${imageId}`, {
    method: 'DELETE'
  });
}

function dataUrlToFile(dataUrl: string, fallbackName: string): File {
  const [metadata, base64] = dataUrl.split(',');
  const mimeType = metadata.match(/data:(.*?);base64/)?.[1] ?? 'image/jpeg';
  const extension = mimeType.split('/')[1] ?? 'jpg';
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return new File([bytes], `${fallbackName}.${extension}`, { type: mimeType });
}
