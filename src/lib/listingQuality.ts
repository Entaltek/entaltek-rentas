import type { Property } from '../types/property';
import { hasValidWhatsapp } from './format';

export interface QualityCheck {
  id: string;
  label: string;
  passed: boolean;
  recommendation: string;
  weight: number;
  earned: number;
}

export interface QualityResult {
  score: number;
  level: 'Básica' | 'Buena' | 'Excelente';
  summary: string;
  checks: QualityCheck[];
  passedCount: number;
}

export function calculateListingQuality(property: Property): QualityResult {
  const amenities = property.amenities ?? [];
  const servicesIncluded = property.servicesIncluded ?? [];
  const requirements = property.requirements ?? [];
  const requiredDocuments = property.requiredDocuments ?? [];

  const checks: QualityCheck[] = [
    createCheck({
      id: 'title',
      label: 'Título claro',
      weight: 10,
      earned: scoreTextLength(property.title, 8, 20, 10),
      recommendation: 'Escribe un título específico: tipo de propiedad, ventaja principal y zona.'
    }),
    createCheck({
      id: 'photos',
      label: 'Galería de fotos',
      weight: 20,
      earned: scorePhotos(property.photos.length),
      recommendation: getPhotoRecommendation(property.photos.length)
    }),
    createCheck({
      id: 'description',
      label: 'Descripción convincente',
      weight: 12,
      earned: scoreTextLength(property.description, 60, 140, 12),
      recommendation: 'Amplía la descripción con estado del inmueble, beneficios, tipo de inquilino ideal y detalles prácticos.'
    }),
    createCheck({
      id: 'price',
      label: 'Precio claro',
      weight: 10,
      earned: property.price > 0 ? 10 : 0,
      recommendation: 'Indica un precio claro para evitar preguntas repetidas.'
    }),
    createCheck({
      id: 'location',
      label: 'Ubicación suficiente',
      weight: 12,
      earned: scoreLocation(property),
      recommendation: 'Agrega colonia/zona, ciudad y referencias. No necesitas publicar la dirección exacta.'
    }),
    createCheck({
      id: 'contact',
      label: 'Contacto por WhatsApp',
      weight: 10,
      earned: hasValidWhatsapp(property.contact.whatsapp) ? 10 : 0,
      recommendation: 'Agrega un WhatsApp válido con lada para facilitar el contacto directo.'
    }),
    createCheck({
      id: 'requirements',
      label: 'Requisitos definidos',
      weight: 7,
      earned: scoreListPresence(requirements, 7),
      recommendation: 'Agrega al menos un requisito, por ejemplo depósito, aval, contrato mínimo o póliza jurídica.'
    }),
    createCheck({
      id: 'requiredDocuments',
      label: 'Documentos requeridos',
      weight: 7,
      earned: scoreListPresence(requiredDocuments, 7),
      recommendation: 'Agrega al menos un documento requerido, por ejemplo INE, comprobante de ingresos o referencias.'
    }),
    createCheck({
      id: 'amenities',
      label: 'Amenidades y servicios',
      weight: 7,
      earned: scoreListPresence([...amenities, ...servicesIncluded], 7),
      recommendation: 'Agrega al menos una amenidad o servicio incluido; no necesitas llenar una lista larga.'
    }),
    createCheck({
      id: 'propertyDetails',
      label: 'Datos básicos del inmueble',
      weight: 5,
      earned: scorePropertyDetails(property),
      recommendation: 'Completa recámaras, baños, estacionamientos y metros cuadrados si los conoces.'
    })
  ];

  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const earnedWeight = checks.reduce((sum, check) => sum + check.earned, 0);
  const score = clamp(Math.round((earnedWeight / totalWeight) * 100), 0, 100);
  const passedCount = checks.filter((check) => check.passed).length;

  const level: QualityResult['level'] = score >= 85 ? 'Excelente' : score >= 65 ? 'Buena' : 'Básica';
  const summary = getSummary(level, score, checks);

  return { score, level, summary, checks, passedCount };
}

function createCheck(check: Omit<QualityCheck, 'passed'>): QualityCheck {
  return {
    ...check,
    earned: clamp(check.earned, 0, check.weight),
    passed: check.earned >= check.weight
  };
}

function scorePhotos(count: number): number {
  if (count >= 6) return 20;
  if (count >= 4) return 16;
  if (count >= 2) return 12;
  if (count === 1) return 7;
  return 0;
}

function getPhotoRecommendation(count: number): string {
  if (count === 0) {
    return 'Agrega fotos reales. Sin fotos la publicación pierde confianza y conversión.';
  }
  if (count < 4) {
    return 'Agrega más fotos: sala, cocina, recámaras, baño y fachada.';
  }
  return 'Con 4 o más fotos ya hay suficiente base; agrega más solo si ayudan a entender mejor la propiedad.';
}

function scoreTextLength(text: string, minimum: number, ideal: number, weight: number): number {
  const length = text.trim().length;

  if (length >= ideal) return weight;
  if (length >= minimum) return Math.round(weight * 0.65);
  if (length > 0) return Math.round(weight * 0.35);
  return 0;
}

function scoreListPresence(items: string[], weight: number): number {
  return items.some((item) => item.trim().length > 0) ? weight : 0;
}

function scoreLocation(property: Property): number {
  const { neighborhood, city, references, nearbyPlaces } = property.location;
  let earned = 0;

  if (neighborhood.trim().length > 2) earned += 4;
  if (city.trim().length > 2) earned += 4;
  if (references.trim().length > 5 || nearbyPlaces.length > 0) earned += 4;

  return earned;
}

function scorePropertyDetails(property: Property): number {
  const detailScores = [
    property.bedrooms > 0 || property.propertyType === 'local' || property.propertyType === 'oficina' ? 1.25 : 0,
    property.bathrooms > 0 ? 1.25 : 0,
    property.areaM2 && property.areaM2 > 0 ? 1.25 : 0,
    property.availableFrom.trim().length > 2 ? 1.25 : 0
  ];

  return detailScores.reduce((sum, value) => sum + value, 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getSummary(level: QualityResult['level'], score: number, checks: QualityCheck[]): string {
  const criticalMissing = checks
    .filter((check) => check.earned === 0 && ['photos', 'price', 'location', 'contact', 'title'].includes(check.id))
    .map((check) => check.label.toLowerCase());

  if (criticalMissing.length) {
    return `Avance real: ${score}%. Falta cerrar puntos críticos: ${criticalMissing.slice(0, 3).join(', ')}.`;
  }

  if (level === 'Excelente') {
    return `Publicación muy completa (${score}%). Ya transmite confianza y reduce preguntas repetidas.`;
  }

  if (level === 'Buena') {
    return `Publicación sólida (${score}%). Con algunos ajustes puede verse mucho más profesional.`;
  }

  return `Publicación básica (${score}%). Todavía faltan datos clave para generar confianza y filtrar interesados.`;
}
