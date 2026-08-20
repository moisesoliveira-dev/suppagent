export const USER_ROLES = ['user', 'technician'] as const

export type UserRole = (typeof USER_ROLES)[number]

export class InvalidUserRoleError extends Error {
  constructor(value: string) {
    super(`perfil de usuário inválido: ${value}`)
  }
}

export function parseUserRole(value: string): UserRole {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'user' || normalized === 'usuario' || normalized === 'usuário') {
    return 'user'
  }
  if (normalized === 'technician' || normalized === 'tecnico' || normalized === 'técnico') {
    return 'technician'
  }
  throw new InvalidUserRoleError(value)
}
