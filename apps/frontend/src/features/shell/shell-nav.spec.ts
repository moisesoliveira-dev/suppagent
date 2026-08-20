import { beforeEach, describe, expect, it } from 'vitest'
import {
  getShellNav,
  navigateTo,
  openChatForTicket,
  consumeChatDraft,
  openTicketFocus,
  consumeTicketFocus,
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

  it('navega entre abas', () => {
    navigateTo('painel')
    expect(getShellNav().view).toBe('painel')
  })
})
