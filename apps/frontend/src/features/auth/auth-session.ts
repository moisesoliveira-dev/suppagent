import { useSyncExternalStore } from 'react'
import type { Session } from './auth'

const SESSION_KEY = 'balcao.auth.session'

let session: Session | null = readStoredSession()
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function readStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    if (parsed?.kind === 'authenticated' && parsed.token && parsed.user?.email) {
      return parsed
    }
    if (parsed?.kind === 'anonymous') return parsed
  } catch {
    /* ignore */
  }
  return null
}

function persist(next: Session | null) {
  if (!next) {
    localStorage.removeItem(SESSION_KEY)
    return
  }
  if (next.kind === 'authenticated') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    return
  }
  // anonymous: só em memória (não “grudar” bypass)
  localStorage.removeItem(SESSION_KEY)
}

export function getSession(): Session | null {
  return session
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAuthSession(): Session | null {
  return useSyncExternalStore(subscribeSession, getSession, () => null)
}

export function setSession(next: Session | null) {
  session = next
  persist(next)
  emit()
}

export function clearSession() {
  setSession(null)
}

export function enterAnonymousSession() {
  setSession({ kind: 'anonymous' })
}
