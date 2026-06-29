export type PropertyType = 'departamento' | 'casa' | 'cuarto' | 'local' | 'oficina';

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
  contactName: string;
  whatsapp: string;
  createdAt: string;
}
