import type { Property } from '../types/property';
import { hasValidWhatsapp } from './format';

export interface PublishValidation {
  canPublish: boolean;
  errors: string[];
  warnings: string[];
}

export function validateForPublish(property: Property): PublishValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const requirements = property.requirements ?? [];
  const requiredDocuments = property.requiredDocuments ?? [];

  if (!property.title.trim()) {
    errors.push('Agrega un título a la propiedad.');
  }
  if (!(property.price > 0)) {
    errors.push('Indica un precio mayor a cero.');
  }
  if (!property.location.city.trim()) {
    errors.push('Indica la ciudad.');
  }
  if (!property.location.neighborhood.trim() && !property.location.address.trim()) {
    errors.push('Agrega la colonia/zona o el domicilio.');
  }
  if (!requirements.length) {
    errors.push('Agrega al menos un requisito de renta o venta.');
  }
  if (!requiredDocuments.length) {
    errors.push('Agrega al menos un documento requerido.');
  }
  if (!hasValidWhatsapp(property.contact.whatsapp)) {
    errors.push('Agrega un WhatsApp de contacto válido (10 dígitos con lada).');
  }

  if (!property.photos.length) {
    warnings.push('Publicarás sin fotos. Las publicaciones con fotos generan mucho más contacto.');
  }
  if (!property.description.trim()) {
    warnings.push('La descripción está vacía. Una buena descripción reduce preguntas repetidas.');
  }
  if (property.photos.length > 8) {
    warnings.push('El preview agrupará fotos extra en un carrete para no saturar la publicación.');
  }

  return { canPublish: errors.length === 0, errors, warnings };
}
