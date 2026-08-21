import { describe, expect, it } from 'vitest'
import { formatNotificationTime, shouldPlaySound } from './notifications'

describe('notifications helpers', () => {
  it('formata tempo relativo', () => {
    const now = new Date('2026-08-21T12:00:00')
    expect(formatNotificationTime('2026-08-21T11:59:45', now)).toBe('agora')
    expect(formatNotificationTime('2026-08-21T11:30:00', now)).toBe('30m')
  })

  it('toca som só com unread aumentando e sound on', () => {
    expect(
      shouldPlaySound({ sound: true }, [{ read: false } as never], 0),
    ).toBe(true)
    expect(
      shouldPlaySound({ sound: false }, [{ read: false } as never], 0),
    ).toBe(false)
    expect(
      shouldPlaySound({ sound: true }, [{ read: false } as never], 2),
    ).toBe(false)
  })
})
