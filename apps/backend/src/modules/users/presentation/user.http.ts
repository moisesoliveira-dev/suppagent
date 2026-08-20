import type { User } from '../domain/user';
import type { UserRole } from '../domain/user-role';

const ROLE_HTTP: Record<UserRole, string> = {
  user: 'usuario',
  technician: 'tecnico',
};

export type UserHttp = {
  id: string;
  name: string;
  email: string;
  role: 'usuario' | 'tecnico';
  roleLabel: string;
  createdAt: string;
};

export function toUserHttp(user: User): UserHttp {
  const role = ROLE_HTTP[user.role] as 'usuario' | 'tecnico';
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    roleLabel: role === 'tecnico' ? 'técnico' : 'usuário',
    createdAt: user.createdAt.toISOString(),
  };
}
