import type { SlaClock } from '../domain/sla-policy';
import type { SlaPolicy, SlaPriority } from '../domain/sla-policy';

const PRIORITY_HTTP: Record<SlaPriority, string> = {
  urgent: 'urgente',
  high: 'alta',
  medium: 'média',
  low: 'baixa',
};

const PRIORITY_FROM_HTTP: Record<string, SlaPriority> = {
  urgente: 'urgent',
  urgent: 'urgent',
  alta: 'high',
  high: 'high',
  media: 'medium',
  média: 'medium',
  medium: 'medium',
  baixa: 'low',
  low: 'low',
};

export function parseSlaPriority(raw: string): SlaPriority {
  const key = raw.trim().toLowerCase();
  const parsed = PRIORITY_FROM_HTTP[key];
  if (!parsed) throw new Error(`prioridade inválida: ${raw}`);
  return parsed;
}

export function priorityLabel(priority: SlaPriority): string {
  return PRIORITY_HTTP[priority];
}

export function formatMinutesLabel(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours}h`;
  return `${minutes}min`;
}

export type SlaClockHttp = {
  tone: SlaClock['tone'];
  shortLabel: string;
  detailText: string;
  detailSub: string;
  dueAt: string | null;
  metAt: string | null;
  targetMinutes: number;
};

export function toSlaClockHttp(clock: SlaClock): SlaClockHttp {
  return {
    tone: clock.tone,
    shortLabel: clock.shortLabel,
    detailText: clock.detailText,
    detailSub: clock.detailSub,
    dueAt: clock.dueAt?.toISOString() ?? null,
    metAt: clock.metAt?.toISOString() ?? null,
    targetMinutes: clock.targetMinutes,
  };
}

export function toSlaPolicyHttp(policy: SlaPolicy) {
  return {
    id: policy.id,
    priority: PRIORITY_HTTP[policy.priority],
    priorityKey: policy.priority,
    responseMinutes: policy.responseMinutes,
    resolutionMinutes: policy.resolutionMinutes,
    targetsLabel: `resposta: ${formatMinutesLabel(policy.responseMinutes)} · resolução: ${formatMinutesLabel(policy.resolutionMinutes)}`,
    updatedAt: policy.updatedAt.toISOString(),
  };
}
