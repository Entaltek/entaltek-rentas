export type PropertyType = 'departamento' | 'casa' | 'cuarto' | 'local' | 'oficina';

export type PropertyStatus = 'draft' | 'published' | 'archived' | 'rented';

/** Referencia a una imagen ya guardada en backend; el id permite eliminarla. */
export interface PropertyImageRef {
  id: string;
  url: string;
  isCover: boolean;
  sortOrder: number;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  type: PropertyType;
  price: number;
  currency: 'MXN';
  zone: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  areaM2?: number;
  furnished: boolean;
  petsAllowed: boolean;
  maintenanceIncluded: boolean;
  depositMonths: number;
  minimumStayMonths?: number;
  availableFrom: string;
  description: string;
  requirements: string[];
  amenities: string[];
  images: string[];
  /** Imágenes que ya viven en backend (subconjunto de `images`). */
  imageRecords?: PropertyImageRef[];
  contactName: string;
  whatsapp: string;
  status: PropertyStatus;
  createdAt: string;
}
