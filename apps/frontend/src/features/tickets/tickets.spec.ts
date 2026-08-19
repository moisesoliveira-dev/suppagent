import { describe, expect, it } from 'vitest'
import { filterTickets, TICKETS } from './tickets'

describe('filterTickets', () => {
  it('retorna todos no filtro todos', () => {
    expect(filterTickets(TICKETS, 'todos')).toHaveLength(10)
  })

  it('filtra meus chamados da agente atual', () => {
    const mine = filterTickets(TICKETS, 'meus')
    expect(mine.every((ticket) => ticket.agent === 'c.reis')).toBe(true)
    expect(mine).toHaveLength(4)
  })

  it('filtra não atribuídos', () => {
    expect(filterTickets(TICKETS, 'naoatribuidos').every((ticket) => ticket.agent === 'livre')).toBe(
      true,
    )
  })

  it('filtra urgentes', () => {
    expect(filterTickets(TICKETS, 'urgentes').every((ticket) => ticket.priority === 'urgente')).toBe(
      true,
    )
  })
})
