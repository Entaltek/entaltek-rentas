import type { Property } from '../types/property';
import { OPERATION_TYPE_LABELS, PROPERTY_TYPE_LABELS } from '../types/property';
import { formatLocationShort, formatPrice, formatPricePeriod } from './format';

interface MarketplaceCopyOptions {
  publicUrl?: string;
}

export function generateMarketplaceCopy(property: Property, options: MarketplaceCopyOptions = {}): string {
  const headline = property.title || `${PROPERTY_TYPE_LABELS[property.propertyType]} en ${OPERATION_TYPE_LABELS[property.operationType].toLowerCase()}`;

  const features = [
    property.bedrooms > 0 ? `${property.bedrooms} recámara${property.bedrooms === 1 ? '' : 's'}` : '',
    property.bathrooms > 0 ? `${property.bathrooms} baño${property.bathrooms === 1 ? '' : 's'}` : '',
    property.parkingSpaces > 0 ? `${property.parkingSpaces} estacionamiento${property.parkingSpaces === 1 ? '' : 's'}` : '',
    property.areaM2 ? `${property.areaM2} m²` : '',
    property.furnished ? 'amueblado' : '',
    property.maintenanceIncluded ? 'mantenimiento incluido' : '',
    property.petsAllowed ? 'acepta mascotas' : ''
  ]
    .filter(Boolean)
    .join(' · ');

  const location = formatLocationShort(property);

  const amenities = property.amenities.length
    ? `\nAmenidades:\n${property.amenities.slice(0, 6).map((item) => `• ${item}`).join('\n')}`
    : '';

  const requirements = property.requirements.length
    ? `\nRequisitos principales:\n${property.requirements.slice(0, 5).map((item) => `• ${item}`).join('\n')}`
    : '';

  const publicLink = options.publicUrl
    ? `\n\nVer fotos, detalles completos y contacto directo:\n${options.publicUrl}`
    : '\n\nPide el link de la ficha completa para ver más fotos y detalles.';

  const lines = [
    `🏠 ${headline}`,
    '',
    property.price > 0 ? `${formatPricePeriod(property)}: ${formatPrice(property)}` : '',
    location ? `Zona: ${location}` : '',
    property.availableFrom ? `Disponible: ${property.availableFrom}` : '',
    features ? `\n${features}` : '',
    property.description ? `\n${property.description}` : '',
    amenities,
    requirements,
    publicLink,
    '\nImportante: verifica la propiedad antes de hacer cualquier pago.'
  ];

  return lines.filter((line) => line !== '').join('\n').replace(/\n{3,}/g, '\n\n');
}
