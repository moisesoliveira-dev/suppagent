import {
  ClientPlan as PrismaClientPlan,
  type Client as PrismaClient,
} from '../../../generated/client';
import { Client } from '../domain/client';
import type { ClientPlan } from '../domain/client-plan';

const PLAN_TO_PRISMA: Record<ClientPlan, PrismaClientPlan> = {
  starter: PrismaClientPlan.STARTER,
  pro: PrismaClientPlan.PRO,
  empresa: PrismaClientPlan.EMPRESA,
};

const PLAN_FROM_PRISMA: Record<PrismaClientPlan, ClientPlan> = {
  [PrismaClientPlan.STARTER]: 'starter',
  [PrismaClientPlan.PRO]: 'pro',
  [PrismaClientPlan.EMPRESA]: 'empresa',
};

export function toDomainClient(record: PrismaClient): Client {
  return Client.reconstitute({
    id: record.id,
    name: record.name,
    company: record.company,
    plan: PLAN_FROM_PRISMA[record.plan],
    email: record.email,
    phone: record.phone,
    tags: record.tags,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toPrismaClientData(client: Client) {
  return {
    id: client.id,
    name: client.name,
    company: client.company,
    plan: PLAN_TO_PRISMA[client.plan],
    email: client.email,
    phone: client.phone,
    tags: client.tags,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  };
}
