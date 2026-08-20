import type { Ticket, TicketStatus } from '../tickets/tickets'
import type { User } from '../users/users'

export const TEAM_CAPACITY = 8

export type TeamLoadLevel = 'low' | 'mid' | 'high'

export type TeamMemberSnapshot = {
  user: User
  openTickets: Ticket[]
  resolvedTickets: Ticket[]
  openCount: number
  resolvedCount: number
  capacity: number
  percent: number
  fill: TeamLoadLevel
}

export function initialsFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

export function isOpenTicketStatus(status: TicketStatus): boolean {
  return status !== 'resolvido'
}

export function loadPercent(openCount: number, capacity = TEAM_CAPACITY): number {
  if (capacity <= 0) return 0
  return Math.min(100, Math.round((Math.max(0, openCount) / capacity) * 100))
}

export function loadFill(openCount: number, capacity = TEAM_CAPACITY): TeamLoadLevel {
  const pct = loadPercent(openCount, capacity)
  if (pct >= 75) return 'high'
  if (pct >= 40) return 'mid'
  return 'low'
}

export function buildTeamMemberSnapshot(
  user: User,
  tickets: Ticket[],
  capacity = TEAM_CAPACITY,
): TeamMemberSnapshot {
  const openTickets = tickets.filter((ticket) => isOpenTicketStatus(ticket.status))
  const resolvedTickets = tickets.filter((ticket) => ticket.status === 'resolvido')
  const openCount = openTickets.length
  return {
    user,
    openTickets,
    resolvedTickets,
    openCount,
    resolvedCount: resolvedTickets.length,
    capacity,
    percent: loadPercent(openCount, capacity),
    fill: loadFill(openCount, capacity),
  }
}
