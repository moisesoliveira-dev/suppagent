import { describe, expect, it } from 'vitest'
import { buildPatchAnim } from './tickets-anim'
import type { Ticket } from './tickets'

function ticket(partial: Partial<Ticket> & Pick<Ticket, 'id'>): Ticket {
  return {
    subject: 'assunto',
    status: 'aberto',
    priority: 'media',
    agent: 'livre',
    agentLabel: '— livre —',
    time: '1m',
    category: 'bug',
    requester: 'a',
    email: 'a@a.com',
    openedAt: '10:00',
    history: [],
    ...partial,
  }
}

describe('buildPatchAnim', () => {
  it('marca linha nova', () => {
    const prev = new Map([['1', ticket({ id: '1' })]])
    const next = [ticket({ id: '1' }), ticket({ id: '2' })]
    const plan = buildPatchAnim(prev, next, 7)
    expect(plan.rowTokens['2']).toBe(7)
    expect(plan.cellTokens['1']).toBeUndefined()
  })

  it('marca só células alteradas', () => {
    const prev = new Map([
      ['1', ticket({ id: '1', status: 'aberto', agent: 'livre', agentLabel: '— livre —' })],
    ])
    const next = [
      ticket({
        id: '1',
        status: 'andamento',
        agent: 'c.reis',
        agentLabel: 'c.reis',
      }),
    ]
    const plan = buildPatchAnim(prev, next, 9)
    expect(plan.rowTokens['1']).toBeUndefined()
    expect(plan.cellTokens['1']?.status).toBe(9)
    expect(plan.cellTokens['1']?.agent).toBe(9)
    expect(plan.cellTokens['1']?.subject).toBeUndefined()
  })
})
