import { describe, expect, it } from 'vitest'
import { barTone, formatGeneratedAt } from './reports'

describe('reports helpers', () => {
  it('formata generatedAt no mesmo dia', () => {
    const now = new Date('2026-08-20T15:00:00')
    const label = formatGeneratedAt('2026-08-20T08:30:00', now)
    expect(label.startsWith('hoje,')).toBe(true)
  })

  it('escolhe tom da barra por share', () => {
    expect(barTone(80)).toBe('bg-red')
    expect(barTone(45)).toBe('bg-amber')
    expect(barTone(10)).toBe('bg-green')
  })
})
