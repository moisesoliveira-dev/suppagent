import { Inject, Injectable } from '@nestjs/common';
import {
  SLA_POLICY_REPOSITORY,
  type SlaPolicyRepository,
} from '../domain/sla-policy.repository';
import type { SlaPolicy } from '../domain/sla-policy';

@Injectable()
export class ListSlaPoliciesService {
  constructor(
    @Inject(SLA_POLICY_REPOSITORY)
    private readonly policies: SlaPolicyRepository,
  ) {}

  execute(): Promise<SlaPolicy[]> {
    return this.policies.findAll();
  }
}
