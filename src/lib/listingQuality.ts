import type { Property } from '../types/property';

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
  const checks: QualityCheck[] = [
    createCheck({
      id: 'photos',
      label: 'Galería de fotos',
      weight: 20,
      earned: scorePhotos(property.images.length),
      recommendation: getPhotoRecommendation(property.images.length)
    }),
    createCheck({
      id: 'description',
      label: 'Descripción convincente',
      weight: 14,
      earned: scoreTextLength(property.description, 60, 140, 14),
      recommendation: 'Amplía la descripción con estado del inmueble, beneficios, tipo de inquilino ideal y detalles prácticos.'
    }),
    createCheck({
      id: 'price',
      label: 'Precio claro',
      weight: 10,
      earned: property.price > 0 ? 10 : 0,
      recommendation: 'Indica una renta mensual clara para evitar preguntas repetidas.'
    }),
    createCheck({
      id: 'location',
      label: 'Ubicación suficiente',
      weight: 10,
      earned: scoreLocation(property.zone, property.city),
      recommendation: 'Agrega zona/colonia y ciudad. No necesitas publicar la dirección exacta.'
    }),
    createCheck({
      id: 'contact',
      label: 'Contacto por WhatsApp',
      weight: 10,
      earned: property.whatsapp.replace(/\D/g, '').length >= 10 ? 10 : 0,
      recommendation: 'Agrega un WhatsApp válido con lada para facilitar el contacto directo.'
    }),
    createCheck({
      id: 'requirements',
      label: 'Requisitos definidos',
      weight: 10,
      earned: scoreList(property.requirements, 1, 3, 10),
      recommendation: 'Agrega requisitos como identificación, comprobante de ingresos, depósito, aval o póliza jurídica.'
    }),
    createCheck({
      id: 'amenities',
      label: 'Amenidades y ventajas',
      weight: 8,
      earned: scoreList(property.amenities, 2, 5, 8),
      recommendation: 'Agrega amenidades y ventajas: cocina, estacionamiento, seguridad, servicios, mantenimiento o cercanía a puntos clave.'
    }),
    createCheck({
      id: 'availability',
      label: 'Disponibilidad',
      weight: 6,
      earned: property.availableFrom.trim().length > 2 ? 6 : 0,
      recommendation: 'Indica desde cuándo está disponible para evitar conversaciones innecesarias.'
    }),
    createCheck({
      id: 'propertyDetails',
      label: 'Datos básicos del inmueble',
      weight: 6,
      earned: scorePropertyDetails(property),
      recommendation: 'Completa recámaras, baños, estacionamiento y metros cuadrados si los conoces.'
    }),
    createCheck({
      id: 'publicLink',
      label: 'Link público generado',
      weight: 6,
      earned: property.slug.trim().length > 0 && !property.id.startsWith('demo-') ? 6 : 0,
      recommendation: 'Guarda la propiedad en backend y publícala para generar el link que compartirás en Marketplace.'
    })
  ];

  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const earnedWeight = checks.reduce((sum, check) => sum + check.earned, 0);
  const score = clamp(Math.round((earnedWeight / totalWeight) * 100), 0, 100);
  const passedCount = checks.filter((check) => check.passed).length;

  const level: QualityResult['level'] = score >= 85 ? 'Excelente' : score >= 65 ? 'Buena' : 'Básica';
  const summary = getSummary(level, score, checks);

  return {
    score,
    level,
    summary,
    checks,
    passedCount
  };
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
    return 'Agrega más fotos: sala, cocina, recámaras, baño y fachada o amenidades.';
  }

  return 'Agrega al menos 6 fotos claras para que la landing se sienta completa.';
}

function scoreTextLength(text: string, minimum: number, ideal: number, weight: number): number {
  const length = text.trim().length;

  if (length >= ideal) return weight;
  if (length >= minimum) return Math.round(weight * 0.65);
  if (length > 0) return Math.round(weight * 0.35);
  return 0;
}

function scoreList(items: string[], minimum: number, ideal: number, weight: number): number {
  const count = items.filter((item) => item.trim().length > 0).length;

  if (count >= ideal) return weight;
  if (count >= minimum) return Math.round(weight * (count / ideal));
  return 0;
}

function scoreLocation(zone: string, city: string): number {
  const hasZone = zone.trim().length > 2;
  const hasCity = city.trim().length > 2;

  if (hasZone && hasCity) return 10;
  if (hasZone || hasCity) return 5;
  return 0;
}

function scorePropertyDetails(property: Property): number {
  const detailScores = [
    property.type ? 1.5 : 0,
    property.bedrooms >= 0 ? 1.5 : 0,
    property.bathrooms >= 0 ? 1.5 : 0,
    property.parkingSpots >= 0 || Boolean(property.areaM2) ? 1.5 : 0
  ];

  return detailScores.reduce((sum, value) => sum + value, 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getSummary(level: QualityResult['level'], score: number, checks: QualityCheck[]): string {
  const criticalMissing = checks
    .filter((check) => check.earned === 0 && ['photos', 'price', 'location', 'contact', 'publicLink'].includes(check.id))
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
