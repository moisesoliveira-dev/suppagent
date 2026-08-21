import type { Session } from './auth'
import { CURRENT_AGENT } from '../tickets/tickets'

export type CurrentUserProfile = {
  name: string
  email: string
  handle: string
  roleLabel: string
}

/** Perfil exibido no shell enquanto o login real não preencher a sessão. */
export const FALLBACK_PROFILE: CurrentUserProfile = {
  name: 'camila reis',
  email: 'camila.reis@balcao.com',
  handle: CURRENT_AGENT,
  roleLabel: 'técnico',
}

export function resolveCurrentUser(session: Session | null): CurrentUserProfile {
  if (session?.kind === 'authenticated') {
    const handle = session.user.handle?.trim() || FALLBACK_PROFILE.handle
    return {
      name: session.user.name,
      email: session.user.email,
      handle,
      roleLabel: session.user.handle ? 'técnico' : 'usuário',
    }
  }
  return FALLBACK_PROFILE
}
