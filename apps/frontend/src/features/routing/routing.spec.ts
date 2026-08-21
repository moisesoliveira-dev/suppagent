import { describe, expect, it } from 'vitest'
import { confidenceClass, statusLabel } from './routing'

describe('routing ui helpers', () => {
  it('formata status e tons', () => {
    expect(statusLabel('revisao')).toBe('revisão')
    expect(statusLabel('aplicado')).toBe('aplicado')
    expect(confidenceClass('high')).toBe('text-green')
    expect(confidenceClass('low')).toBe('text-red')
  })
})
