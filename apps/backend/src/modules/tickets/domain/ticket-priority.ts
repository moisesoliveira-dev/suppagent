export const TICKET_PRIORITIES = [
  'urgent',
  'high',
  'medium',
  'low',
] as const;

export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
