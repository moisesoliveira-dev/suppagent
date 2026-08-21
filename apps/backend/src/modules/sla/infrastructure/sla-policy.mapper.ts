import {
  TicketPriority as PrismaPriority,
  type SlaPolicy as PrismaSlaPolicy,
} from '../../../generated/client';
import { SlaPolicy, type SlaPriority } from '../domain/sla-policy';

const TO_DOMAIN: Record<PrismaPriority, SlaPriority> = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

const TO_PRISMA: Record<SlaPriority, PrismaPriority> = {
  urgent: PrismaPriority.URGENT,
  high: PrismaPriority.HIGH,
  medium: PrismaPriority.MEDIUM,
  low: PrismaPriority.LOW,
};

export function toDomainSlaPriority(priority: PrismaPriority): SlaPriority {
  return TO_DOMAIN[priority];
}

export function toPrismaSlaPriority(priority: SlaPriority): PrismaPriority {
  return TO_PRISMA[priority];
}

export function toDomainSlaPolicy(record: PrismaSlaPolicy): SlaPolicy {
  return SlaPolicy.reconstitute({
    id: record.id,
    priority: toDomainSlaPriority(record.priority),
    responseMinutes: record.responseMinutes,
    resolutionMinutes: record.resolutionMinutes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}
