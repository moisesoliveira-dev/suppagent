import { describe, expect, it } from 'vitest'
import { CLIENT_PLAN_OPTIONS } from './clients'

describe('clients', () => {
  it('expõe planos conhecidos', () => {
    expect(CLIENT_PLAN_OPTIONS.map((item) => item.id)).toEqual([
      'starter',
      'pro',
      'empresa',
    ])
  })
})
