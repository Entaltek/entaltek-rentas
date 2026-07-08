export type PropertyStatus = 'draft' | 'published' | 'unpublished';

export type PropertyType = 'departamento' | 'casa' | 'habitacion' | 'local' | 'oficina' | 'otro';

export type OperationType = 'renta' | 'venta' | 'renta-temporal';

export type PricePeriod = 'monthly' | 'weekly' | 'daily';

export type Currency = 'MXN' | 'USD';

export type ParkingType = 'nearby' | 'private' | 'street';
export type ParkingVehicleSize = 'compact' | 'sedan' | 'suv' | 'pickup' | 'van';
export type BathroomType = 'full' | 'half' | 'shared';
export type RoomType = 'single' | 'double' | 'shared';
export type ContractUnit = 'dia' | 'semana' | 'mes' | 'anio';

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
  depositMonths?: number;
  minimumContractText: string;
  minimumContractQuantity?: number;
  minimumContractUnit?: ContractUnit;
  availableFrom: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  parkingTypes?: ParkingType[];
  parkingVehicleSize?: ParkingVehicleSize;
  areaM2?: number;
  furnished: boolean;
  petsAllowed: boolean;
  bathroomTypes?: BathroomType[];
  roomTypes?: RoomType[];
  peoplePerRoom?: number;
  sharedRooms?: number;
  isSharedProperty?: boolean;
  sharedPeopleCount?: number;
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

export const CONTRACT_UNIT_LABELS: Record<ContractUnit, string> = {
  dia: 'día',
  semana: 'semana',
  mes: 'mes',
  anio: 'año'
};

export const PARKING_TYPE_LABELS: Record<ParkingType, string> = {
  nearby: 'Cuenta con estacionamiento cerca',
  private: 'Tiene cajón de estacionamiento',
  street: 'Estacionamiento en vía pública'
};

export const PARKING_VEHICLE_SIZE_LABELS: Record<ParkingVehicleSize, string> = {
  compact: 'Compacto',
  sedan: 'Sedán',
  suv: 'SUV',
  pickup: 'Camioneta',
  van: 'Van'
};

export const BATHROOM_TYPE_LABELS: Record<BathroomType, string> = {
  full: 'Baño completo',
  half: 'Medio baño',
  shared: 'Baño compartido'
};

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  single: 'Recámara para 1 persona',
  double: 'Recámara para 2 personas',
  shared: 'Recámara compartida'
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
    depositMonths: undefined,
    minimumContractText: '',
    minimumContractQuantity: undefined,
    minimumContractUnit: 'mes',
    availableFrom: '',
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    parkingTypes: [],
    parkingVehicleSize: undefined,
    areaM2: undefined,
    furnished: false,
    petsAllowed: false,
    bathroomTypes: [],
    roomTypes: [],
    peoplePerRoom: undefined,
    sharedRooms: undefined,
    isSharedProperty: false,
    sharedPeopleCount: undefined,
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
