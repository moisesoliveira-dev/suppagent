import { useSyncExternalStore } from 'react'
import type { ViewId } from './nav'
import { NAV_GROUPS } from './nav'

export type ShellNavState = {
  view: ViewId
  chatTicketId: string | null
  chatDraft: string
  ticketFocusId: string | null
  knowledgeFocusId: string | null
}

const VALID_VIEWS = new Set<ViewId>(
  NAV_GROUPS.flatMap((group) => group.items.map((item) => item.id)),
)

export function parseViewFromHash(hash: string): ViewId | null {
  const raw = hash.replace(/^#\/?/, '').split(/[?/]/)[0]?.trim() ?? ''
  if (!raw) return null
  return VALID_VIEWS.has(raw as ViewId) ? (raw as ViewId) : null
}

function readViewFromLocation(): ViewId {
  if (typeof window === 'undefined') return 'painel'
  return parseViewFromHash(window.location.hash) ?? 'painel'
}

function writeViewToLocation(view: ViewId) {
  if (typeof window === 'undefined') return
  const next = `#${view}`
  if (window.location.hash === next) return
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${next}`)
}

let state: ShellNavState = {
  view: readViewFromLocation(),
  chatTicketId: null,
  chatDraft: '',
  ticketFocusId: null,
  knowledgeFocusId: null,
}

const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function setState(patch: Partial<ShellNavState>) {
  state = { ...state, ...patch }
  if (patch.view !== undefined) writeViewToLocation(state.view)
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

export function openKnowledgeFocus(articleId: string) {
  setState({
    view: 'baseconhecimento',
    knowledgeFocusId: articleId,
  })
}

export function consumeKnowledgeFocus(): string | null {
  const id = state.knowledgeFocusId
  if (id) setState({ knowledgeFocusId: null })
  return id
}

function onHashChange() {
  const view = readViewFromLocation()
  if (view === state.view) return
  state = { ...state, view }
  emit()
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', onHashChange)
}

/** só para testes */
export function resetShellNav(view: ViewId = 'painel') {
  state = {
    view,
    chatTicketId: null,
    chatDraft: '',
    ticketFocusId: null,
    knowledgeFocusId: null,
  }
  writeViewToLocation(view)
  emit()
}
