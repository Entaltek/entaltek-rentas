import type { Property } from '../types/property';

export interface QualityCheck {
  id: string;
  label: string;
  passed: boolean;
  recommendation: string;
  weight: number;
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
    {
      id: 'photos',
      label: 'Fotos suficientes',
      passed: property.images.length >= 6,
      recommendation: 'Agrega al menos 6 fotos claras: portada, sala, cocina, recámaras, baño y exterior si aplica.',
      weight: 18
    },
    {
      id: 'cover',
      label: 'Portada definida',
      passed: property.images.length > 0,
      recommendation: 'Agrega una foto principal atractiva; será lo primero que verá el interesado.',
      weight: 8
    },
    {
      id: 'description',
      label: 'Descripción completa',
      passed: property.description.trim().length >= 120,
      recommendation: 'Amplía la descripción con ventajas, estado del inmueble, tipo de inquilino ideal y detalles importantes.',
      weight: 14
    },
    {
      id: 'price',
      label: 'Precio claro',
      passed: property.price > 0,
      recommendation: 'Indica una renta mensual clara para evitar preguntas repetidas.',
      weight: 10
    },
    {
      id: 'location',
      label: 'Zona y ciudad',
      passed: property.zone.trim().length > 2 && property.city.trim().length > 2,
      recommendation: 'Aclara zona/colonia y ciudad. Puedes mantener la ubicación exacta privada.',
      weight: 10
    },
    {
      id: 'contact',
      label: 'WhatsApp de contacto',
      passed: property.whatsapp.replace(/\D/g, '').length >= 10,
      recommendation: 'Agrega un WhatsApp válido con lada para facilitar el contacto directo.',
      weight: 10
    },
    {
      id: 'requirements',
      label: 'Requisitos definidos',
      passed: property.requirements.length >= 3,
      recommendation: 'Agrega requisitos como identificación, comprobante de ingresos, depósito, aval o póliza jurídica.',
      weight: 10
    },
    {
      id: 'amenities',
      label: 'Amenidades visibles',
      passed: property.amenities.length >= 4,
      recommendation: 'Agrega amenidades y ventajas: cocina, estacionamiento, seguridad, servicios, mantenimiento o cercanía a puntos clave.',
      weight: 8
    },
    {
      id: 'availability',
      label: 'Disponibilidad clara',
      passed: property.availableFrom.trim().length > 2,
      recommendation: 'Indica desde cuándo está disponible para evitar conversaciones innecesarias.',
      weight: 6
    },
    {
      id: 'rules',
      label: 'Reglas clave aclaradas',
      passed: typeof property.petsAllowed === 'boolean' && typeof property.furnished === 'boolean' && typeof property.maintenanceIncluded === 'boolean',
      recommendation: 'Aclara mascotas, amueblado y mantenimiento incluido para filtrar mejor interesados.',
      weight: 6
    }
  ];

  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const earnedWeight = checks.reduce((sum, check) => sum + (check.passed ? check.weight : 0), 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);
  const passedCount = checks.filter((check) => check.passed).length;

  const level: QualityResult['level'] = score >= 85 ? 'Excelente' : score >= 65 ? 'Buena' : 'Básica';
  const summary = getSummary(level, score);

  return {
    score,
    level,
    summary,
    checks,
    passedCount
  };
}

function getSummary(level: QualityResult['level'], score: number): string {
  if (level === 'Excelente') {
    return `Publicación muy completa (${score}%). Ya transmite confianza y reduce preguntas repetidas.`;
  }

  if (level === 'Buena') {
    return `Publicación sólida (${score}%). Con algunos ajustes puede verse mucho más profesional.`;
  }

  return `Publicación básica (${score}%). Todavía faltan datos clave para generar confianza y filtrar interesados.`;
}
