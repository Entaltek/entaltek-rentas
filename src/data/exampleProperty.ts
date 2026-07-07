import type { Property } from '../types/property';

// Datos de EJEMPLO. Solo se usan en la sección de demostración del home
// y nunca se mezclan con propiedades reales guardadas por el usuario.
export const EXAMPLE_PROPERTY_ID = 'example-showcase';

export const exampleProperty: Property = {
  id: EXAMPLE_PROPERTY_ID,
  slug: '',
  status: 'draft',
  title: 'Departamento amueblado en zona norte',
  propertyType: 'departamento',
  operationType: 'renta',
  description:
    'Departamento cómodo, bien iluminado y listo para habitar. Ideal para profesionistas, pareja o familia pequeña que busca una ubicación práctica y una renta clara desde el primer contacto.',
  price: 12000,
  currency: 'MXN',
  pricePeriod: 'monthly',
  maintenanceIncluded: true,
  depositText: '1 mes de depósito',
  minimumContractText: 'Contrato mínimo de 12 meses',
  availableFrom: 'Inmediata',
  bedrooms: 2,
  bathrooms: 1,
  parkingSpaces: 1,
  areaM2: 78,
  furnished: true,
  petsAllowed: false,
  servicesIncluded: ['Agua', 'Mantenimiento', 'Internet'],
  amenities: ['Cocina equipada', 'Closet', 'Estacionamiento techado', 'Zona tranquila', 'Balcón'],
  requirements: [
    'Identificación oficial',
    'Comprobante de ingresos',
    'Un mes de depósito',
    'Contrato mínimo de 12 meses'
  ],
  location: {
    country: 'México',
    state: 'Guanajuato',
    city: 'León',
    neighborhood: 'Zona norte',
    address: '',
    references: 'A dos cuadras del blvd. Campestre, frente a parque vecinal.',
    showExactAddress: false,
    nearbyPlaces: [
      { id: 'ex-np-1', name: 'Oxxo', type: 'tienda', distanceText: 'a 2 min caminando' },
      { id: 'ex-np-2', name: 'Farmacia Guadalajara', type: 'tienda', distanceText: 'a 5 min' },
      { id: 'ex-np-3', name: 'Parque vecinal', type: 'parque', distanceText: 'enfrente' },
      { id: 'ex-np-4', name: 'Paradero de camión', type: 'transporte', distanceText: 'a 1 cuadra' }
    ]
  },
  contact: {
    name: 'Asesor Entaltek',
    whatsapp: '524771234567'
  },
  photos: [
    {
      id: 'ex-photo-1',
      url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop',
      title: 'Sala',
      alt: 'Sala iluminada del departamento de ejemplo',
      isCover: true,
      order: 0
    },
    {
      id: 'ex-photo-2',
      url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop',
      title: 'Cocina',
      alt: 'Cocina equipada del departamento de ejemplo',
      isCover: false,
      order: 1
    },
    {
      id: 'ex-photo-3',
      url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop',
      title: 'Recámara principal',
      alt: 'Recámara principal del departamento de ejemplo',
      isCover: false,
      order: 2
    }
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};
