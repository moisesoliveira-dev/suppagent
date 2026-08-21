import type { Client } from '../domain/client';
import { CLIENT_PLAN_LABELS } from '../domain/client-plan';
import type {
  ClientTicketRef,
  ClientWithTickets,
} from '../domain/client.repository';

const STATUS_HTTP: Record<ClientTicketRef['status'], string> = {
  open: 'aberto',
  in_progress: 'andamento',
  waiting: 'aguardando',
  resolved: 'resolvido',
};

const OPEN_STATUSES = new Set<ClientTicketRef['status']>([
  'open',
  'in_progress',
  'waiting',
]);

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function formatElapsed(from: Date, now: Date): string {
  const delta = Math.max(0, now.getTime() - from.getTime());
  if (delta < HOUR) return `${Math.max(1, Math.round(delta / MINUTE))}m`;
  if (delta < DAY) return `${Math.max(1, Math.round(delta / HOUR))}h`;
  return `${Math.max(1, Math.round(delta / DAY))}d`;
}

export type ClientTicketHttp = {
  id: string;
  label: string;
  status: string;
};

export type ClientHttp = {
  id: string;
  name: string;
  company: string | null;
  displayName: string;
  plan: string;
  email: string;
  phone: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  since: string;
  sinceLong: string;
  openCount: number;
  openLabel: string;
  totalTickets: number;
  lastContact: string;
  tickets: ClientTicketHttp[];
};

function formatSince(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    month: 'short',
    year: '2-digit',
  });
}

function formatSinceLong(date: Date): string {
  return `desde ${date.toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric',
  })}`;
}

function openLabel(count: number, tickets: ClientTicketRef[]): string {
  if (count === 0) return '0 aberto';
  const waiting = tickets.filter((t) => t.status === 'waiting').length;
  const inProgress = tickets.filter((t) => t.status === 'in_progress').length;
  if (waiting === count) return `${count} aguardando`;
  if (inProgress === count) return `${count} andamento`;
  return `${count} aberto`;
}

export function toClientHttp(
  item: ClientWithTickets,
  now = new Date(),
): ClientHttp {
  const { client, tickets } = item;
  const openTickets = tickets.filter((t) => OPEN_STATUSES.has(t.status));
  const last = tickets[0]?.updatedAt ?? null;
  const company = client.company;
  const displayName = company ? `${client.name} — ${company}` : client.name;

  return {
    id: client.id,
    name: client.name,
    company,
    displayName,
    plan: CLIENT_PLAN_LABELS[client.plan],
    email: client.email,
    phone: client.phone,
    tags: client.tags,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
    since: formatSince(client.createdAt),
    sinceLong: formatSinceLong(client.createdAt),
    openCount: openTickets.length,
    openLabel: openLabel(openTickets.length, openTickets),
    totalTickets: tickets.length,
    lastContact: last ? `${formatElapsed(last, now)} atrás` : '—',
    tickets: tickets.map((ticket) => ({
      id: String(ticket.id),
      label: `#${ticket.id} — ${ticket.subject}`,
      status: STATUS_HTTP[ticket.status],
    })),
  };
}

export function toClientHttpBasic(client: Client): {
  id: string;
  name: string;
  company: string | null;
  displayName: string;
  plan: string;
  email: string;
  phone: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
} {
  const company = client.company;
  return {
    id: client.id,
    name: client.name,
    company,
    displayName: company ? `${client.name} — ${company}` : client.name,
    plan: CLIENT_PLAN_LABELS[client.plan],
    email: client.email,
    phone: client.phone,
    tags: client.tags,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  };
}
