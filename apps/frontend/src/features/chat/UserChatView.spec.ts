import { describe, expect, it } from 'vitest'
import { matchesChatSearch, matchesTeamSearch } from './UserChatView'
import type { Ticket } from '../tickets/tickets'
import type { TeamChatSummary } from './team-chat-api'

const ticket = {
  id: '4471',
  subject: 'erro ao gerar relatório',
  status: 'aberto',
  priority: 'alta',
  agent: 'livre',
  agentLabel: '—',
  time: '12m',
  category: 'financeiro',
  requester: 'marina costa',
  email: 'marina@ex.com',
  openedAt: 'hoje',
  history: [
    {
      id: 'm1',
      time: '10:00',
      text: 'o relatório ainda está travando',
      author: 'requester',
      authorName: 'marina costa',
    },
  ],
} satisfies Ticket

const team = {
  id: 'team-ops',
  name: 'ops interno',
  kind: 'channel',
  category: 'equipe',
  time: '1m',
  snippet: 'alguém viu o deploy?',
  messages: [],
} satisfies TeamChatSummary

describe('matchesChatSearch', () => {
  it('filtra por número, solicitante e trecho', () => {
    expect(matchesChatSearch(ticket, '')).toBe(true)
    expect(matchesChatSearch(ticket, '#4471')).toBe(true)
    expect(matchesChatSearch(ticket, 'marina')).toBe(true)
    expect(matchesChatSearch(ticket, 'travando')).toBe(true)
    expect(matchesChatSearch(ticket, 'inexistente')).toBe(false)
  })
})

describe('matchesTeamSearch', () => {
  it('filtra por nome e snippet', () => {
    expect(matchesTeamSearch(team, '')).toBe(true)
    expect(matchesTeamSearch(team, 'ops')).toBe(true)
    expect(matchesTeamSearch(team, 'deploy')).toBe(true)
    expect(matchesTeamSearch(team, 'financeiro')).toBe(false)
  })
})
