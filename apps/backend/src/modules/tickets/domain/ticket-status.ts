export const TICKET_STATUSES = [
  'open',
  'in_progress',
  'waiting',
  'resolved',
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];
