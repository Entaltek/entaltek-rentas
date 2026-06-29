import type { Property } from '../types/property';
import { formatCurrency } from './format';

interface MarketplaceCopyOptions {
  publicUrl?: string;
}

export function generateMarketplaceCopy(property: Property, options: MarketplaceCopyOptions = {}): string {
  const features = [
    `${property.bedrooms} recámara${property.bedrooms === 1 ? '' : 's'}`,
    `${property.bathrooms} baño${property.bathrooms === 1 ? '' : 's'}`,
    `${property.parkingSpots} estacionamiento${property.parkingSpots === 1 ? '' : 's'}`,
    property.furnished ? 'amueblado' : 'sin amueblar',
    property.maintenanceIncluded ? 'mantenimiento incluido' : 'mantenimiento no incluido',
    property.petsAllowed ? 'acepta mascotas' : 'no mascotas'
  ].join(' · ');

  const amenities = property.amenities.length
    ? `\nAmenidades:\n${property.amenities.slice(0, 6).map((item) => `• ${item}`).join('\n')}`
    : '';

  const requirements = property.requirements.length
    ? `\nRequisitos principales:\n${property.requirements.slice(0, 5).map((item) => `• ${item}`).join('\n')}`
    : '';

  const publicLink = options.publicUrl
    ? `\n\nVer fotos, detalles completos y contacto directo:\n${options.publicUrl}`
    : '\n\nPide el link de la ficha completa para ver más fotos y detalles.';

  return `🏠 ${property.title}\n\nRenta mensual: ${formatCurrency(property.price)}\nZona: ${property.zone}, ${property.city}\nDisponible: ${property.availableFrom}\n\n${features}\n\n${property.description}${amenities}\n${requirements}${publicLink}\n\nImportante: verifica la propiedad antes de hacer cualquier pago.`;
}
