import type { Property } from '../types/property';

// Cliente de la API remota. Contrato REST esperado del backend:
//   GET    /api/properties
//   GET    /api/properties/:id
//   GET    /api/properties/slug/:slug
//   POST   /api/properties
//   PUT    /api/properties/:id
//   PATCH  /api/properties/:id/publish
//   PATCH  /api/properties/:id/unpublish
//   DELETE /api/properties/:id
// El body de entrada/salida es el modelo Property completo en camelCase.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export function isRemoteApiConfigured(): boolean {
  return Boolean(API_BASE_URL);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.');
  }

  if (response.status === 404) {
    throw new NotFoundError();
  }

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message);
  }

  return (await response.json()) as T;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.message === 'string') return body.message;
    if (typeof body?.detail === 'string') return body.detail;
  } catch {
    // sin body JSON
  }
  return `El servidor respondió con un error (${response.status}). Intenta de nuevo.`;
}

export class NotFoundError extends Error {
  constructor() {
    super('No encontramos esta propiedad.');
    this.name = 'NotFoundError';
  }
}

export async function listProperties(): Promise<Property[]> {
  return request<Property[]>('/api/properties');
}

export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    return await request<Property>(`/api/properties/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  try {
    return await request<Property>(`/api/properties/slug/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
}

export async function saveProperty(property: Property): Promise<Property> {
  if (property.id) {
    return request<Property>(`/api/properties/${encodeURIComponent(property.id)}`, {
      method: 'PUT',
      body: JSON.stringify(property)
    });
  }

  return request<Property>('/api/properties', {
    method: 'POST',
    body: JSON.stringify(property)
  });
}

export async function publishProperty(id: string): Promise<Property> {
  return request<Property>(`/api/properties/${encodeURIComponent(id)}/publish`, { method: 'PATCH' });
}

export async function unpublishProperty(id: string): Promise<Property> {
  return request<Property>(`/api/properties/${encodeURIComponent(id)}/unpublish`, { method: 'PATCH' });
}

export async function deleteProperty(id: string): Promise<void> {
  await request<unknown>(`/api/properties/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
