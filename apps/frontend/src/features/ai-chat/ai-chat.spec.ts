import { describe, expect, it } from 'vitest'
import { formatSessionTime } from './ai-chat'

describe('ai-chat helpers', () => {
  it('formata tempo relativo da sessão', () => {
    const now = new Date('2026-08-20T12:30:00.000Z')
    expect(formatSessionTime('2026-08-20T12:29:50.000Z', now)).toBe('agora')
    expect(formatSessionTime('2026-08-20T12:00:00.000Z', now)).toBe('30m')
  })
})
