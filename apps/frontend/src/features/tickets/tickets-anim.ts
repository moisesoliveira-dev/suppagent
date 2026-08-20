import type { Ticket } from './tickets'

export type CellField = 'id' | 'subject' | 'status' | 'priority' | 'agent' | 'time'

export type AnimPlan = {
  listToken: number
  rowTokens: Record<string, number>
  cellTokens: Record<string, Partial<Record<CellField, number>>>
}

export const EMPTY_ANIM: AnimPlan = {
  listToken: 0,
  rowTokens: {},
  cellTokens: {},
}

export function nextAnimToken() {
  return Date.now() + Math.floor(Math.random() * 1000)
}

export function snapshotTickets(tickets: Ticket[]) {
  return new Map(tickets.map((ticket) => [ticket.id, ticket]))
}

export function buildPatchAnim(
  previous: Map<string, Ticket>,
  next: Ticket[],
  token = nextAnimToken(),
): Pick<AnimPlan, 'rowTokens' | 'cellTokens'> {
  const rowTokens: Record<string, number> = {}
  const cellTokens: Record<string, Partial<Record<CellField, number>>> = {}

  for (const ticket of next) {
    const before = previous.get(ticket.id)
    if (!before) {
      rowTokens[ticket.id] = token
      continue
    }
    const fields: CellField[] = []
    if (before.status !== ticket.status) fields.push('status')
    if (before.priority !== ticket.priority) fields.push('priority')
    if (before.agentLabel !== ticket.agentLabel || before.agent !== ticket.agent) {
      fields.push('agent')
    }
    if (before.subject !== ticket.subject) fields.push('subject')
    if (before.time !== ticket.time) fields.push('time')
    if (fields.length === 0) continue
    cellTokens[ticket.id] = Object.fromEntries(
      fields.map((field) => [field, token]),
    ) as Partial<Record<CellField, number>>
  }

  return { rowTokens, cellTokens }
}

export function mergeAnimPlan(
  current: AnimPlan,
  patch: Pick<AnimPlan, 'rowTokens' | 'cellTokens'>,
): AnimPlan {
  return {
    listToken: 0,
    rowTokens: { ...current.rowTokens, ...patch.rowTokens },
    cellTokens: {
      ...current.cellTokens,
      ...Object.fromEntries(
        Object.entries(patch.cellTokens).map(([id, fields]) => [
          id,
          { ...(current.cellTokens[id] ?? {}), ...fields },
        ]),
      ),
    },
  }
}
