import { useSyncExternalStore } from 'react'
import type { ViewId } from './nav'

export type ShellNavState = {
  view: ViewId
  chatTicketId: string | null
  chatDraft: string
  ticketFocusId: string | null
}

let state: ShellNavState = {
  view: 'chamados',
  chatTicketId: null,
  chatDraft: '',
  ticketFocusId: null,
}

const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function setState(patch: Partial<ShellNavState>) {
  state = { ...state, ...patch }
  emit()
}

export function getShellNav(): ShellNavState {
  return state
}

export function subscribeShellNav(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useShellNav(): ShellNavState {
  return useSyncExternalStore(subscribeShellNav, getShellNav, getShellNav)
}

export function navigateTo(view: ViewId) {
  setState({ view })
}

export function openChatForTicket(ticketId: string, draft = '') {
  setState({
    view: 'chatusuarios',
    chatTicketId: ticketId,
    chatDraft: draft,
  })
}

export function selectChatTicket(ticketId: string) {
  setState({ chatTicketId: ticketId })
}

export function consumeChatDraft(): string {
  const draft = state.chatDraft
  if (draft) setState({ chatDraft: '' })
  return draft
}

export function openTicketFocus(ticketId: string) {
  setState({
    view: 'chamados',
    ticketFocusId: ticketId,
  })
}

export function consumeTicketFocus(): string | null {
  const id = state.ticketFocusId
  if (id) setState({ ticketFocusId: null })
  return id
}

/** só para testes */
export function resetShellNav() {
  state = {
    view: 'chamados',
    chatTicketId: null,
    chatDraft: '',
    ticketFocusId: null,
  }
  emit()
}
