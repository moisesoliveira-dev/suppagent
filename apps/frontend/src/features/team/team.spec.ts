import { describe, expect, it } from 'vitest'
import {
  buildTeamMemberSnapshot,
  initialsFromName,
  loadFill,
  loadPercent,
} from './team'
import type { Ticket } from '../tickets/tickets'
import type { User } from '../users/users'

const user: User = {
  id: 'u1',
  name: 'camila reis',
  email: 'camila.reis@balcao.com',
  handle: 'c.reis',
  role: 'tecnico',
  roleLabel: 'técnico',
  createdAt: '2026-01-01',
}

function ticket(partial: Partial<Ticket> & Pick<Ticket, 'id' | 'status'>): Ticket {
  return {
    subject: 'assunto',
    priority: 'media',
    agent: 'c.reis',
    agentLabel: 'c.reis',
    time: '12:00',
    category: 'acesso',
    requester: 'cliente',
    email: 'c@x.com',
    openedAt: 'hoje',
    history: [],
    ...partial,
  }
}

describe('team helpers', () => {
  it('monta iniciais do nome', () => {
    expect(initialsFromName('camila reis')).toBe('CR')
    expect(initialsFromName('bruno')).toBe('BR')
  })

  it('calcula carga e nível', () => {
    expect(loadPercent(0)).toBe(0)
    expect(loadPercent(4)).toBe(50)
    expect(loadPercent(8)).toBe(100)
    expect(loadPercent(10)).toBe(100)
    expect(loadFill(2)).toBe('low')
    expect(loadFill(4)).toBe('mid')
    expect(loadFill(7)).toBe('high')
  })

  it('separa chamados abertos e resolvidos', () => {
    const snap = buildTeamMemberSnapshot(user, [
      ticket({ id: '1', status: 'aberto' }),
      ticket({ id: '2', status: 'andamento' }),
      ticket({ id: '3', status: 'resolvido' }),
    ])
    expect(snap.openCount).toBe(2)
    expect(snap.resolvedCount).toBe(1)
    expect(snap.fill).toBe('low')
  })
})
