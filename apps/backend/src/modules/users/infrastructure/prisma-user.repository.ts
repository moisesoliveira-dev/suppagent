import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/persistence/prisma.service';
import type { User } from '../domain/user';
import type { UserRole } from '../domain/user-role';
import type { UserRepository } from '../domain/user.repository';
import { toDomainUser, toPrismaRole } from './user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? toDomainUser(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    return record ? toDomainUser(record) : null;
  }

  async findByHandle(handle: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { handle: handle.trim().toLowerCase() },
    });
    return record ? toDomainUser(record) : null;
  }

  async findAll(role?: UserRole): Promise<User[]> {
    const records = await this.prisma.user.findMany({
      where: role ? { role: toPrismaRole(role) } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return records.map(toDomainUser);
  }

  async save(user: User): Promise<User> {
    if (user.isNew) {
      const created = await this.prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          handle: user.handle,
          role: toPrismaRole(user.role),
          createdAt: user.createdAt,
        },
      });
      return toDomainUser(created);
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        handle: user.handle,
        role: toPrismaRole(user.role),
      },
    });
    return toDomainUser(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
