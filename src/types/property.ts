export type PropertyStatus = 'draft' | 'published' | 'unpublished';

export type PropertyType = 'departamento' | 'casa' | 'habitacion' | 'local' | 'oficina' | 'otro';

export type OperationType = 'renta' | 'venta' | 'renta-temporal';

export type PricePeriod = 'monthly' | 'weekly' | 'daily';

export type Currency = 'MXN' | 'USD';

export type NearbyPlaceType =
  | 'supermercado'
  | 'escuela'
  | 'hospital'
  | 'parque'
  | 'transporte'
  | 'restaurante'
  | 'tienda'
  | 'otro';

export interface NearbyPlace {
  id: string;
  name: string;
  type: NearbyPlaceType;
  distanceText?: string;
  distanceMeters?: number;
}

export interface PropertyLocation {
  country: string;
  state: string;
  city: string;
  neighborhood: string;
  address: string;
  references: string;
  googleMapsUrl?: string;
  lat?: number;
  lng?: number;
  showExactAddress: boolean;
  nearbyPlaces: NearbyPlace[];
}

export interface PropertyContact {
  name: string;
  whatsapp: string;
  email?: string;
}

export interface PropertyPhoto {
  id: string;
  url: string;
  title: string;
  alt: string;
  isCover: boolean;
  order: number;
}

export interface Property {
  id: string;
  slug: string;
  status: PropertyStatus;
  title: string;
  propertyType: PropertyType;
  operationType: OperationType;
  description: string;
  price: number;
  currency: Currency;
  pricePeriod: PricePeriod;
  maintenanceIncluded: boolean;
  depositText: string;
  minimumContractText: string;
  availableFrom: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  areaM2?: number;
  furnished: boolean;
  petsAllowed: boolean;
  featureTags: string[];
  servicesIncluded: string[];
  amenities: string[];
  requirements: string[];
  requiredDocuments: string[];
  location: PropertyLocation;
  contact: PropertyContact;
  photos: PropertyPhoto[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  expiresAt?: string;
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  departamento: 'Departamento',
  casa: 'Casa',
  habitacion: 'Habitación',
  local: 'Local comercial',
  oficina: 'Oficina',
  otro: 'Otro'
};

export const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  renta: 'Renta',
  venta: 'Venta',
  'renta-temporal': 'Renta temporal'
};

export const PRICE_PERIOD_LABELS: Record<PricePeriod, string> = {
  monthly: 'mensual',
  weekly: 'semanal',
  daily: 'diaria'
};

export const NEARBY_PLACE_TYPE_LABELS: Record<NearbyPlaceType, string> = {
  supermercado: 'Supermercado',
  escuela: 'Escuela',
  hospital: 'Hospital',
  parque: 'Parque',
  transporte: 'Transporte',
  restaurante: 'Restaurante',
  tienda: 'Tienda',
  otro: 'Otro'
};

export function createEmptyLocation(): PropertyLocation {
  return {
    country: 'México',
    state: '',
    city: '',
    neighborhood: '',
    address: '',
    references: '',
    googleMapsUrl: '',
    showExactAddress: false,
    nearbyPlaces: []
  };
}

export function createEmptyProperty(): Property {
  const now = new Date().toISOString();

  return {
    id: '',
    slug: '',
    status: 'draft',
    title: '',
    propertyType: 'departamento',
    operationType: 'renta',
    description: '',
    price: 0,
    currency: 'MXN',
    pricePeriod: 'monthly',
    maintenanceIncluded: false,
    depositText: '',
    minimumContractText: '',
    availableFrom: '',
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    areaM2: undefined,
    furnished: false,
    petsAllowed: false,
    featureTags: [],
    servicesIncluded: [],
    amenities: [],
    requirements: [],
    requiredDocuments: [],
    location: createEmptyLocation(),
    contact: { name: '', whatsapp: '' },
    photos: [],
    createdAt: now,
    updatedAt: now
  };
}
