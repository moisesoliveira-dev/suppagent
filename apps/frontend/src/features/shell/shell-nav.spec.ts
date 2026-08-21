import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getShellNav,
  navigateTo,
  openChatForTicket,
  consumeChatDraft,
  openTicketFocus,
  consumeTicketFocus,
  openKnowledgeFocus,
  consumeKnowledgeFocus,
  parseViewFromHash,
  resetShellNav,
} from '../shell/shell-nav'

beforeEach(() => {
  resetShellNav()
})

describe('shell-nav', () => {
  it('abre o chat do chamado com rascunho', () => {
    openChatForTicket('4471', 'olá marina')
    expect(getShellNav().view).toBe('chatusuarios')
    expect(getShellNav().chatTicketId).toBe('4471')
    expect(consumeChatDraft()).toBe('olá marina')
    expect(getShellNav().chatDraft).toBe('')
  })

  it('foca chamado na aba de tickets', () => {
    openTicketFocus('4468')
    expect(getShellNav().view).toBe('chamados')
    expect(consumeTicketFocus()).toBe('4468')
    expect(getShellNav().ticketFocusId).toBeNull()
  })

  it('foca artigo na base de conhecimento', () => {
    openKnowledgeFocus('seed-kb-senha')
    expect(getShellNav().view).toBe('baseconhecimento')
    expect(consumeKnowledgeFocus()).toBe('seed-kb-senha')
    expect(getShellNav().knowledgeFocusId).toBeNull()
  })

  it('navega entre abas', () => {
    navigateTo('painel')
    expect(getShellNav().view).toBe('painel')
  })

  it('lê aba válida do hash da url', () => {
    expect(parseViewFromHash('#automacoes')).toBe('automacoes')
    expect(parseViewFromHash('#/equipe')).toBe('equipe')
    expect(parseViewFromHash('#inexistente')).toBeNull()
    expect(parseViewFromHash('')).toBeNull()
  })

  it('grava a aba no hash ao navegar', () => {
    const replaceState = vi.fn()
    vi.stubGlobal('window', {
      location: { hash: '', pathname: '/', search: '' },
      history: { replaceState },
      addEventListener: vi.fn(),
    })
    navigateTo('relatorios')
    expect(getShellNav().view).toBe('relatorios')
    expect(replaceState).toHaveBeenCalledWith(null, '', '/#relatorios')
    vi.unstubAllGlobals()
  })
})
