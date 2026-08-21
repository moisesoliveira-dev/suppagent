import type { SlaClock, SlaTone } from './sla-policy';

const WARN_RATIO = 0.25;

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.round(Math.abs(ms) / 60_000));
  if (totalMin < 60) return `${totalMin}min`;
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

export function formatClockTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function toneForRemaining(
  remainingMs: number,
  targetMs: number,
): SlaTone {
  if (remainingMs < 0) return 'breach';
  if (remainingMs <= targetMs * WARN_RATIO) return 'warn';
  return 'ok';
}

export function computeResponseClock(input: {
  openedAt: Date;
  firstAgentReplyAt: Date | null;
  targetMinutes: number;
  now?: Date;
}): SlaClock {
  const now = input.now ?? new Date();
  const dueAt = addMinutes(input.openedAt, input.targetMinutes);
  const targetMs = input.targetMinutes * 60_000;

  if (input.firstAgentReplyAt) {
    const elapsed = input.firstAgentReplyAt.getTime() - input.openedAt.getTime();
    const met = elapsed <= targetMs;
    return {
      tone: met ? 'ok' : 'breach',
      shortLabel: met ? 'cumprida' : 'vencida',
      detailText: met
        ? `cumprida em ${formatDuration(elapsed)}`
        : `vencida há ${formatDuration(elapsed - targetMs)}`,
      detailSub: met
        ? `prazo era ${formatDuration(targetMs)} · dentro do sla`
        : `prazo era ${formatDuration(targetMs)} · sla de resposta não cumprido`,
      dueAt,
      metAt: input.firstAgentReplyAt,
      targetMinutes: input.targetMinutes,
    };
  }

  const remaining = dueAt.getTime() - now.getTime();
  const tone = toneForRemaining(remaining, targetMs);
  if (remaining < 0) {
    return {
      tone: 'breach',
      shortLabel: 'vencida',
      detailText: `vencida há ${formatDuration(-remaining)}`,
      detailSub: `prazo era ${formatDuration(targetMs)} · sla de resposta não cumprido`,
      dueAt,
      metAt: null,
      targetMinutes: input.targetMinutes,
    };
  }
  return {
    tone,
    shortLabel: `restam ${formatDuration(remaining)}`,
    detailText: `restam ${formatDuration(remaining)}`,
    detailSub: `prazo de ${formatDuration(targetMs)} ainda em andamento`,
    dueAt,
    metAt: null,
    targetMinutes: input.targetMinutes,
  };
}

export function computeResolutionClock(input: {
  openedAt: Date;
  resolvedAt: Date | null;
  targetMinutes: number;
  now?: Date;
}): SlaClock {
  const now = input.now ?? new Date();
  const dueAt = addMinutes(input.openedAt, input.targetMinutes);
  const targetMs = input.targetMinutes * 60_000;

  if (input.resolvedAt) {
    const elapsed = input.resolvedAt.getTime() - input.openedAt.getTime();
    const met = elapsed <= targetMs;
    return {
      tone: met ? 'ok' : 'breach',
      shortLabel: met ? 'cumprida' : 'vencida',
      detailText: met
        ? `cumprida em ${formatDuration(elapsed)}`
        : `vencida há ${formatDuration(elapsed - targetMs)}`,
      detailSub: met
        ? `prazo era ${formatDuration(targetMs)} · dentro do sla`
        : `sla de resolução não cumprido`,
      dueAt,
      metAt: input.resolvedAt,
      targetMinutes: input.targetMinutes,
    };
  }

  const remaining = dueAt.getTime() - now.getTime();
  const tone = toneForRemaining(remaining, targetMs);
  if (remaining < 0) {
    return {
      tone: 'breach',
      shortLabel: `vencida há ${formatDuration(-remaining)}`,
      detailText: `vencida há ${formatDuration(-remaining)}`,
      detailSub: 'sla de resolução não cumprido',
      dueAt,
      metAt: null,
      targetMinutes: input.targetMinutes,
    };
  }
  return {
    tone,
    shortLabel: `restam ${formatDuration(remaining)}`,
    detailText: `restam ${formatDuration(remaining)}`,
    detailSub: `vencimento previsto às ${formatClockTime(dueAt)}`,
    dueAt,
    metAt: null,
    targetMinutes: input.targetMinutes,
  };
}

export function isSlaCompliant(
  response: SlaClock,
  resolution: SlaClock,
): boolean {
  return response.tone !== 'breach' && resolution.tone !== 'breach';
}

export function buildSlaTimeline(input: {
  openedAt: Date;
  firstAgentReplyAt: Date | null;
  resolvedAt: Date | null;
  response: SlaClock;
  resolution: SlaClock;
  now?: Date;
}): { time: string; text: string }[] {
  const now = input.now ?? new Date();
  const lines: { time: string; text: string }[] = [
    {
      time: formatClockTime(input.openedAt),
      text: 'chamado aberto — sla iniciado',
    },
  ];
  if (input.firstAgentReplyAt) {
    lines.push({
      time: formatClockTime(input.firstAgentReplyAt),
      text:
        input.response.tone === 'ok'
          ? 'primeira resposta enviada — dentro do prazo'
          : 'primeira resposta enviada — fora do prazo',
    });
  } else if (input.response.tone === 'breach') {
    lines.push({
      time: formatClockTime(now),
      text: 'alerta crítico — sla de resposta vencido',
    });
  } else if (input.response.tone === 'warn' && input.response.dueAt) {
    lines.push({
      time: formatClockTime(now),
      text: 'alerta — restam menos de 25% do prazo de resposta',
    });
  }
  if (input.resolvedAt) {
    lines.push({
      time: formatClockTime(input.resolvedAt),
      text:
        input.resolution.tone === 'ok'
          ? 'chamado encerrado — dentro do sla de resolução'
          : 'chamado encerrado — fora do sla de resolução',
    });
  } else if (input.resolution.tone === 'breach') {
    lines.push({
      time: formatClockTime(now),
      text: 'alerta crítico — sla de resolução vencido',
    });
  }
  return lines;
}

export function compliancePercent(met: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((met / total) * 100);
}
