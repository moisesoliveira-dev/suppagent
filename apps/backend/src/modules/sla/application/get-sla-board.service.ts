import { Inject, Injectable } from '@nestjs/common';
import {
  buildSlaTimeline,
  compliancePercent,
  computeResolutionClock,
  computeResponseClock,
  isSlaCompliant,
} from '../domain/sla-clock';
import type { SlaPriority } from '../domain/sla-policy';
import {
  SLA_POLICY_REPOSITORY,
  type SlaPolicyRepository,
} from '../domain/sla-policy.repository';
import {
  SLA_TICKET_QUERY,
  type SlaTicketQuery,
} from '../domain/sla-ticket.query';

const TONE_RANK = { breach: 0, warn: 1, ok: 2 } as const;

@Injectable()
export class GetSlaBoardService {
  constructor(
    @Inject(SLA_POLICY_REPOSITORY)
    private readonly policies: SlaPolicyRepository,
    @Inject(SLA_TICKET_QUERY)
    private readonly tickets: SlaTicketQuery,
  ) {}

  async execute(now = new Date()) {
    const [policyList, ticketList] = await Promise.all([
      this.policies.findAll(),
      this.tickets.listForBoard(),
    ]);

    const byPriority = new Map(
      policyList.map((policy) => [policy.priority, policy]),
    );

    const compliance = new Map<
      SlaPriority,
      { met: number; total: number }
    >();
    for (const policy of policyList) {
      compliance.set(policy.priority, { met: 0, total: 0 });
    }

    const items = ticketList
      .map((ticket) => {
        const policy = byPriority.get(ticket.priority);
        if (!policy) return null;
        const response = computeResponseClock({
          openedAt: ticket.openedAt,
          firstAgentReplyAt: ticket.firstAgentReplyAt,
          targetMinutes: policy.responseMinutes,
          now,
        });
        const resolution = computeResolutionClock({
          openedAt: ticket.openedAt,
          resolvedAt: ticket.resolvedAt,
          targetMinutes: policy.resolutionMinutes,
          now,
        });
        const bucket = compliance.get(ticket.priority);
        if (bucket) {
          bucket.total += 1;
          if (isSlaCompliant(response, resolution)) bucket.met += 1;
        }
        return {
          id: ticket.id,
          subject: ticket.subject,
          priority: ticket.priority,
          status: ticket.status,
          openedAt: ticket.openedAt.toISOString(),
          policy: {
            responseMinutes: policy.responseMinutes,
            resolutionMinutes: policy.resolutionMinutes,
          },
          response,
          resolution,
          timeline: buildSlaTimeline({
            openedAt: ticket.openedAt,
            firstAgentReplyAt: ticket.firstAgentReplyAt,
            resolvedAt: ticket.resolvedAt,
            response,
            resolution,
            now,
          }),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        const aRank = Math.min(
          TONE_RANK[a.response.tone],
          TONE_RANK[a.resolution.tone],
        );
        const bRank = Math.min(
          TONE_RANK[b.response.tone],
          TONE_RANK[b.resolution.tone],
        );
        if (aRank !== bRank) return aRank - bRank;
        return b.id - a.id;
      });

    return {
      generatedAt: now.toISOString(),
      policies: policyList.map((policy) => {
        const bucket = compliance.get(policy.priority) ?? {
          met: 0,
          total: 0,
        };
        return {
          id: policy.id,
          priority: policy.priority,
          responseMinutes: policy.responseMinutes,
          resolutionMinutes: policy.resolutionMinutes,
          compliancePercent: compliancePercent(bucket.met, bucket.total),
          openCount: bucket.total,
        };
      }),
      items,
    };
  }
}
