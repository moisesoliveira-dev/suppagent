import { describe, expect, it } from 'vitest'
import {
  complianceBarClass,
  countdownClass,
  priorityTitleClass,
} from './sla'

describe('sla ui helpers', () => {
  it('mapeia tons e barras', () => {
    expect(countdownClass('ok')).toBe('text-green')
    expect(countdownClass('warn')).toBe('text-amber')
    expect(countdownClass('breach')).toBe('text-red')
    expect(complianceBarClass(95)).toBe('bg-green')
    expect(complianceBarClass(85)).toBe('bg-amber')
    expect(complianceBarClass(70)).toBe('bg-red')
    expect(priorityTitleClass('urgente')).toBe('text-red')
    expect(priorityTitleClass('baixa')).toBe('text-dim')
  })
})
