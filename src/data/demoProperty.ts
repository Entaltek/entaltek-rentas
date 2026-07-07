import type { Property } from '../types/property';

export const demoProperty: Property = {
  id: 'demo-001',
  slug: 'depa-amueblado-zona-norte-12000',
  title: 'Departamento amueblado en zona norte',
  type: 'departamento',
  price: 12000,
  currency: 'MXN',
  zone: 'Zona norte',
  city: 'León, Guanajuato',
  bedrooms: 2,
  bathrooms: 1,
  parkingSpots: 1,
  areaM2: 78,
  furnished: true,
  petsAllowed: false,
  maintenanceIncluded: true,
  depositMonths: 1,
  minimumStayMonths: 12,
  availableFrom: 'Inmediata',
  description:
    'Departamento cómodo, bien iluminado y listo para habitar. Ideal para profesionistas, pareja o familia pequeña que busca una ubicación práctica y una renta clara desde el primer contacto.',
  requirements: [
    'Identificación oficial',
    'Comprobante de ingresos',
    'Un mes de depósito',
    'Contrato mínimo de 12 meses'
  ],
  amenities: ['Cocina equipada', 'Closet', 'Estacionamiento', 'Mantenimiento incluido', 'Zona tranquila'],
  images: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop'
  ],
  contactName: 'Asesor inmobiliario',
  whatsapp: '524771234567',
  status: 'draft',
  createdAt: new Date().toISOString()
};
