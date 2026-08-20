import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createKnowledgeFromTicket,
  listKnowledge,
} from './knowledge-api'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('knowledge-api', () => {
  it('lista artigos com filtro de categoria', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [{ id: 'a1', title: 'senha' }] }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const data = await listKnowledge({ category: 'acesso' })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/knowledge?category=acesso',
      expect.any(Object),
    )
    expect(data.items).toHaveLength(1)
  })

  it('cria artigo a partir de chamado encerrado', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'kb-1', sourceTicketId: '4430' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await createKnowledgeFromTicket({
      ticketId: '4430',
      author: 'camila reis',
      title: 'como resetar senha',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/knowledge/from-ticket',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          ticketId: 4430,
          author: 'camila reis',
          title: 'como resetar senha',
        }),
      }),
    )
  })
})
