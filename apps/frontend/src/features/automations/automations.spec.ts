import { describe, expect, it } from 'vitest'
import { formatAutomationRelative, automationMeta, automationSub } from './automations'

describe('automations helpers', () => {
  const base = {
    id: '1',
    name: 'teste',
    trigger: 'novo chamado',
    condition: 'urgente',
    action: 'notificar',
    enabled: true,
    authorName: 'camila reis',
    runCount: 2,
    lastRunAt: '2026-08-20T12:00:00.000Z',
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-20T10:00:00.000Z',
  }

  it('formata última execução', () => {
    const now = new Date('2026-08-20T12:30:00.000Z')
    expect(formatAutomationRelative(null)).toBe('nunca')
    expect(formatAutomationRelative(base.lastRunAt, now)).toBe('há 30 min')
  })

  it('monta meta e sub', () => {
    expect(automationMeta(base)).toContain('2 execuções')
    expect(automationSub({ ...base, enabled: false })).toContain('inativa')
  })
})
