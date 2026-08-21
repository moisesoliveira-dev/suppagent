import { describe, expect, it } from 'vitest'
import { FALLBACK_PROFILE, resolveCurrentUser } from './current-user'

describe('resolveCurrentUser', () => {
  it('usa fallback anônimo', () => {
    expect(resolveCurrentUser(null)).toEqual(FALLBACK_PROFILE)
    expect(resolveCurrentUser({ kind: 'anonymous' })).toEqual(FALLBACK_PROFILE)
  })

  it('usa sessão autenticada', () => {
    expect(
      resolveCurrentUser({
        kind: 'authenticated',
        token: 't',
        user: {
          name: 'bruno alves',
          email: 'bruno.alves@balcao.com',
          handle: 'b.alves',
        },
      }),
    ).toEqual({
      name: 'bruno alves',
      email: 'bruno.alves@balcao.com',
      handle: 'b.alves',
      roleLabel: 'técnico',
    })
  })
})
