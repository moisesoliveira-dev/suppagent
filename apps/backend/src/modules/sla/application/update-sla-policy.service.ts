import { Inject, Injectable } from '@nestjs/common';
import type { SlaPolicy, SlaPriority } from '../domain/sla-policy';
import {
  SLA_POLICY_REPOSITORY,
  type SlaPolicyRepository,
} from '../domain/sla-policy.repository';
import { SlaPolicyNotFoundError } from '../domain/sla.errors';

export type UpdateSlaPolicyCommand = {
  priority: SlaPriority;
  responseMinutes: number;
  resolutionMinutes: number;
};

@Injectable()
export class UpdateSlaPolicyService {
  constructor(
    @Inject(SLA_POLICY_REPOSITORY)
    private readonly policies: SlaPolicyRepository,
  ) {}

  async execute(command: UpdateSlaPolicyCommand): Promise<SlaPolicy> {
    const policy = await this.policies.findByPriority(command.priority);
    if (!policy) throw new SlaPolicyNotFoundError(command.priority);
    policy.updateTargets({
      responseMinutes: command.responseMinutes,
      resolutionMinutes: command.resolutionMinutes,
    });
    await this.policies.save(policy);
    return policy;
  }
}
