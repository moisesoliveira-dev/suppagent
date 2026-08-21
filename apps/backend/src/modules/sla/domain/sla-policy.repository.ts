import type { SlaPolicy, SlaPriority } from './sla-policy';

export const SLA_POLICY_REPOSITORY = Symbol('SLA_POLICY_REPOSITORY');

export interface SlaPolicyRepository {
  findAll(): Promise<SlaPolicy[]>;
  findByPriority(priority: SlaPriority): Promise<SlaPolicy | null>;
  save(policy: SlaPolicy): Promise<void>;
}
