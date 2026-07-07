import { apiFetch } from './client';

// --- Tipos alineados con backend/app/schemas/lead.py ---

export type LeadStatus = 'new' | 'contacted' | 'visit_scheduled' | 'discarded' | 'rented';

export interface CreateLeadPayload {
  property_id: string;
  name: string;
  phone: string;
  email?: string;
  move_in_date?: string;
  budget?: number;
  has_pets?: boolean;
  has_guarantor?: boolean;
  message?: string;
}

export interface ApiLead {
  id: string;
  property_id: string;
  name: string;
  phone: string;
  email: string | null;
  move_in_date: string | null;
  /** Pydantic serializa Decimal como string en JSON. */
  budget: string | number | null;
  has_pets: boolean | null;
  has_guarantor: boolean | null;
  message: string | null;
  status: LeadStatus;
  created_at: string;
}

// --- Endpoints ---

export async function createLead(payload: CreateLeadPayload): Promise<ApiLead> {
  return apiFetch<ApiLead>('/api/v1/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function listLeads(propertyId: string): Promise<ApiLead[]> {
  return apiFetch<ApiLead[]>(`/api/v1/properties/${propertyId}/leads`);
}

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<ApiLead> {
  return apiFetch<ApiLead>(`/api/v1/leads/${leadId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
}
