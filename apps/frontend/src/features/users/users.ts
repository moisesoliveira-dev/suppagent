export type UserRole = 'usuario' | 'tecnico'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  roleLabel: string
  createdAt: string
}

export type UserListResponse = {
  items: User[]
}

export const USER_ROLE_OPTIONS: { id: UserRole; label: string }[] = [
  { id: 'usuario', label: 'usuário' },
  { id: 'tecnico', label: 'técnico' },
]
