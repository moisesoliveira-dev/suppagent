import { apiRequest } from '../../shared/api/http'
import type { User, UserListResponse, UserRole } from './users'

export function listUsers(): Promise<UserListResponse> {
  return apiRequest<UserListResponse>('/users')
}

export function createUser(input: {
  name: string
  email: string
  role: UserRole
}): Promise<User> {
  return apiRequest<User>('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteUser(id: string): Promise<void> {
  return apiRequest<void>(`/users/${id}`, { method: 'DELETE' })
}
