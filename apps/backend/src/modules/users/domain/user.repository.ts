import type { User } from './user';
import type { UserRole } from './user-role';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByHandle(handle: string): Promise<User | null>;
  findAll(role?: UserRole): Promise<User[]>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
