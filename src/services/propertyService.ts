import type { Property } from '../types/property';
import * as localRepository from './localPropertyRepository';
import * as remoteApi from './remotePropertyApi';

// Fachada de datos: si hay una API configurada (VITE_API_BASE_URL) se usa el
// backend remoto; si no, un repositorio local en el navegador con el mismo
// contrato. Las páginas y componentes solo hablan con este servicio.
interface PropertyRepository {
  listProperties(): Promise<Property[]>;
  getPropertyById(id: string): Promise<Property | null>;
  getPropertyBySlug(slug: string): Promise<Property | null>;
  saveProperty(property: Property): Promise<Property>;
  publishProperty(id: string): Promise<Property>;
  unpublishProperty(id: string): Promise<Property>;
  deleteProperty(id: string): Promise<void>;
}

const repository: PropertyRepository = remoteApi.isRemoteApiConfigured() ? remoteApi : localRepository;

export const isUsingRemoteBackend = remoteApi.isRemoteApiConfigured();

export const {
  listProperties,
  getPropertyById,
  getPropertyBySlug,
  saveProperty,
  publishProperty,
  unpublishProperty,
  deleteProperty
} = repository;
