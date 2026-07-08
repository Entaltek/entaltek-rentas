import type { Property } from '../types/property';
import * as localRepository from './localPropertyRepository';
import * as remoteApi from './remotePropertyApi';
import * as supabaseRepository from './supabasePropertyRepository';

// Fachada de datos. Prioridad:
// 1) Backend REST si existe VITE_API_BASE_URL.
// 2) Supabase si existen VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.
// 3) localStorage para demo/desarrollo sin infraestructura.
// Las páginas y componentes solo hablan con este servicio.
interface PropertyRepository {
  listProperties(): Promise<Property[]>;
  getPropertyById(id: string): Promise<Property | null>;
  getPropertyBySlug(slug: string): Promise<Property | null>;
  saveProperty(property: Property): Promise<Property>;
  publishProperty(id: string): Promise<Property>;
  unpublishProperty(id: string): Promise<Property>;
  deleteProperty(id: string): Promise<void>;
}

function resolveRepository(): PropertyRepository {
  if (remoteApi.isRemoteApiConfigured()) return remoteApi;
  if (supabaseRepository.isSupabaseConfigured()) return supabaseRepository;
  return localRepository;
}

const repository: PropertyRepository = resolveRepository();

export const isUsingRemoteBackend = remoteApi.isRemoteApiConfigured();
export const isUsingSupabase = supabaseRepository.isSupabaseConfigured();

export const {
  listProperties,
  getPropertyById,
  getPropertyBySlug,
  saveProperty,
  publishProperty,
  unpublishProperty,
  deleteProperty
} = repository;
