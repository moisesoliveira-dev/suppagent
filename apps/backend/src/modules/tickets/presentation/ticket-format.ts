import type { TicketPriority } from '../domain/ticket-priority';
import type { TicketStatus } from '../domain/ticket-status';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatElapsed(from: Date, now: Date): string {
  const delta = Math.max(0, now.getTime() - from.getTime());
  if (delta < HOUR) return `${Math.max(1, Math.round(delta / MINUTE))}m`;
  if (delta < DAY) return `${Math.max(1, Math.round(delta / HOUR))}h`;
  return `${Math.max(1, Math.round(delta / DAY))}d`;
}

export function formatOpenedAt(from: Date, now: Date): string {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfFrom = new Date(from);
  startOfFrom.setHours(0, 0, 0, 0);
  const days = Math.round(
    (startOfToday.getTime() - startOfFrom.getTime()) / DAY,
  );
  if (days <= 0) {
    return from.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
  if (days === 1) return 'ontem';
  return `${days}d`;
}

export function formatHistoryTime(at: Date): string {
  return at.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const STATUS_HTTP: Record<TicketStatus, string> = {
  open: 'aberto',
  in_progress: 'andamento',
  waiting: 'aguardando',
  resolved: 'resolvido',
};

const PRIORITY_HTTP: Record<TicketPriority, string> = {
  urgent: 'urgente',
  high: 'alta',
  medium: 'media',
  low: 'baixa',
};

const PRIORITY_FROM_HTTP: Record<string, TicketPriority> = {
  urgente: 'urgent',
  alta: 'high',
  media: 'medium',
  média: 'medium',
  baixa: 'low',
};

export function statusToHttp(status: TicketStatus): string {
  return STATUS_HTTP[status];
}

export function priorityToHttp(priority: TicketPriority): string {
  return PRIORITY_HTTP[priority];
}

export function parsePriority(value: string): TicketPriority {
  const priority = PRIORITY_FROM_HTTP[value.trim().toLowerCase()];
  if (!priority) throw new Error(`prioridade inválida: ${value}`);
  return priority;
}
