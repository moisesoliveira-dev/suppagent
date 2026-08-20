import { afterEach, describe, expect, it, vi } from 'vitest'
import { CURRENT_AGENT, EMPTY_COUNTS } from './tickets'
import { closeTicket, listTickets, reopenTicket, replyToTicket, transferTicket } from './tickets-api'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('tickets-api', () => {
  it('lista chamados da API com filtro e agente', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        filter: 'meus',
        agent: CURRENT_AGENT,
        counts: { ...EMPTY_COUNTS, todos: 10, meus: 4 },
        items: [{ id: '4465', subject: 'cobrança', agent: CURRENT_AGENT }],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const data = await listTickets('meus')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/tickets?filter=meus&agent=c.reis&page=1&pageSize=10',
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    )
    expect(data.counts.meus).toBe(4)
    expect(data.items).toHaveLength(1)
  })

  it('envia resposta, transferência e encerramento', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '4471', history: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '4471', agent: 'b.alves' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '4471', status: 'resolvido' }),
      })
    vi.stubGlobal('fetch', fetchMock)

    await replyToTicket('4471', 'já estou vendo')
    await transferTicket('4471', 'b.alves')
    await closeTicket('4471')

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3000/tickets/4471/replies',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ text: 'já estou vendo', note: false }),
      }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3000/tickets/4471/transfer',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ agent: 'b.alves' }),
      }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://localhost:3000/tickets/4471/close',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('reabre chamado com justificativa', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: '4471', status: 'andamento' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await reopenTicket('4471', 'cliente voltou a reportar')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/tickets/4471/reopen',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ reason: 'cliente voltou a reportar' }),
      }),
    )
  })

  it('propaga erro da API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'filtro de chamados inválido: x' }),
      }),
    )

    await expect(listTickets('todos')).rejects.toThrow('filtro de chamados inválido')
  })
})
