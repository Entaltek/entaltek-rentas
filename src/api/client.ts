const DEFAULT_API_URL = 'http://localhost:8000';

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Base URL del backend FastAPI.
 * Se configura con VITE_API_URL (.env / .env.production) y usa
 * http://localhost:8000 como fallback para desarrollo local.
 */
export const API_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL ?? DEFAULT_API_URL);

export class ApiError extends Error {
  /** Código HTTP de la respuesta; 0 cuando el backend no respondió (error de red). */
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

interface FastApiValidationItem {
  loc?: (string | number)[];
  msg?: string;
}

function extractErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null && 'detail' in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      const messages = (detail as FastApiValidationItem[])
        .map((item) => {
          const field = item.loc?.filter((part) => part !== 'body').join('.');
          return field && item.msg ? `${field}: ${item.msg}` : item.msg ?? '';
        })
        .filter(Boolean);
      if (messages.length) return messages.join(' · ');
    }
  }
  return fallback;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError(0, 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.');
  }

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // La respuesta no era JSON; usamos el mensaje genérico.
    }
    throw new ApiError(
      response.status,
      extractErrorMessage(body, `El servidor respondió con un error (${response.status}).`)
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/** Convierte rutas relativas devueltas por el backend (ej. /media/...) en URLs absolutas. */
export function resolveMediaUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
}
