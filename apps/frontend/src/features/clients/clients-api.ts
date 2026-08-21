import { apiRequest } from '../../shared/api/http'
import type {
  Client,
  ClientListResponse,
  CreateClientInput,
  UpdateClientInput,
} from './clients'

export function listClients(): Promise<ClientListResponse> {
  return apiRequest<ClientListResponse>('/clients')
}

export function getClient(id: string): Promise<Client> {
  return apiRequest<Client>(`/clients/${id}`)
}

export function createClient(input: CreateClientInput): Promise<Client> {
  return apiRequest<Client>('/clients', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateClient(
  id: string,
  input: UpdateClientInput,
): Promise<Client> {
  return apiRequest<Client>(`/clients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteClient(id: string): Promise<void> {
  return apiRequest<void>(`/clients/${id}`, { method: 'DELETE' })
}
