import { apiRequest } from '../../shared/api/http'
import type { User, UserListResponse, UserRole } from './users'

export function listUsers(role?: UserRole): Promise<UserListResponse> {
  const params = role ? `?role=${role}` : ''
  return apiRequest<UserListResponse>(`/users${params}`)
}

export function createUser(input: {
  name: string
  email: string
  role: UserRole
  handle?: string | null
}): Promise<User> {
  return apiRequest<User>('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteUser(id: string): Promise<void> {
  return apiRequest<void>(`/users/${id}`, { method: 'DELETE' })
}
