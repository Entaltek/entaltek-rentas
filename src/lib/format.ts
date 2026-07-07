import type { Property } from '../types/property';
import { PRICE_PERIOD_LABELS } from '../types/property';

export function formatCurrency(value: number, currency: 'MXN' | 'USD' = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPrice(property: Property): string {
  return formatCurrency(property.price, property.currency);
}

export function formatPricePeriod(property: Property): string {
  if (property.operationType === 'venta') return 'Precio de venta';
  return `Renta ${PRICE_PERIOD_LABELS[property.pricePeriod]}`;
}

export function formatLocationShort(property: Property): string {
  const { neighborhood, city, state } = property.location;
  return [neighborhood, city, state].filter(Boolean).join(', ');
}

export function formatPublicAddress(property: Property): string {
  const { address, showExactAddress } = property.location;
  if (showExactAddress && address.trim()) return address;
  return '';
}

export function cleanWhatsapp(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function hasValidWhatsapp(raw: string): boolean {
  return cleanWhatsapp(raw).length >= 10;
}

export function buildWhatsappUrl(property: Property): string {
  const phone = cleanWhatsapp(property.contact.whatsapp);
  const message = `Hola, vi la propiedad "${property.title || 'en renta'}" en Entaltek Rentas. ¿Sigue disponible?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
