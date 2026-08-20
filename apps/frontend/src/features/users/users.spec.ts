import { afterEach, describe, expect, it, vi } from 'vitest'
import { createUser, deleteUser, listUsers } from './users-api'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('users-api', () => {
  it('lista e cria usuários', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: '1',
              name: 'camila',
              email: 'c@balcao.com',
              role: 'tecnico',
              roleLabel: 'técnico',
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: '2',
          name: 'marina',
          email: 'm@acme.com',
          role: 'usuario',
          roleLabel: 'usuário',
        }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const listed = await listUsers()
    const created = await createUser({
      name: 'marina',
      email: 'm@acme.com',
      role: 'usuario',
    })

    expect(listed.items[0]?.role).toBe('tecnico')
    expect(created.role).toBe('usuario')
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3000/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'marina',
          email: 'm@acme.com',
          role: 'usuario',
        }),
      }),
    )
  })

  it('remove usuário', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => undefined,
    })
    vi.stubGlobal('fetch', fetchMock)

    await deleteUser('abc')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/users/abc',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})
