import { UserRole as PrismaUserRole } from '../../../generated/client';
import { User } from '../domain/user';
import type { UserRole } from '../domain/user-role';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  handle: string | null;
  role: PrismaUserRole;
  createdAt: Date;
};

const ROLE_TO_PRISMA: Record<UserRole, PrismaUserRole> = {
  user: PrismaUserRole.USER,
  technician: PrismaUserRole.TECHNICIAN,
};

const ROLE_FROM_PRISMA: Record<PrismaUserRole, UserRole> = {
  USER: 'user',
  TECHNICIAN: 'technician',
};

export function toPrismaRole(role: UserRole): PrismaUserRole {
  return ROLE_TO_PRISMA[role];
}

export function toDomainUser(record: UserRecord): User {
  return User.reconstitute({
    id: record.id,
    name: record.name,
    email: record.email,
    handle: record.handle,
    role: ROLE_FROM_PRISMA[record.role],
    createdAt: record.createdAt,
  });
}
