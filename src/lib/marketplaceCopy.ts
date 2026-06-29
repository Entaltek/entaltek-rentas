import type { Property } from '../types/property';
import { formatCurrency } from './format';

export function generateMarketplaceCopy(property: Property): string {
  const features = [
    `${property.bedrooms} recámara${property.bedrooms === 1 ? '' : 's'}`,
    `${property.bathrooms} baño${property.bathrooms === 1 ? '' : 's'}`,
    `${property.parkingSpots} estacionamiento${property.parkingSpots === 1 ? '' : 's'}`,
    property.furnished ? 'amueblado' : 'sin amueblar',
    property.maintenanceIncluded ? 'mantenimiento incluido' : 'mantenimiento no incluido'
  ].join(' · ');

  return `🏠 ${property.title}\n\nRenta: ${formatCurrency(property.price)}\nZona: ${property.zone}, ${property.city}\n\n${features}\n\n${property.description}\n\nRequisitos principales:\n${property.requirements.map((item) => `- ${item}`).join('\n')}\n\nMás fotos, detalles y contacto directo en el link de la propiedad.`;
}
