import {
  matchesTicketFilter,
  parseTicketFilter,
  InvalidTicketFilterError,
} from './ticket-filter';

describe('ticket-filter', () => {
  it('usa todos quando o filtro vem vazio', () => {
    expect(parseTicketFilter(undefined)).toBe('todos');
  });

  it('rejeita filtro desconhecido', () => {
    expect(() => parseTicketFilter('inbox')).toThrow(InvalidTicketFilterError);
  });

  it('aplica meus, livres e urgentes', () => {
    const mine = { agentId: 'c.reis', priority: 'high' };
    const free = { agentId: null, priority: 'urgent' };
    expect(matchesTicketFilter(mine, 'meus', 'c.reis')).toBe(true);
    expect(matchesTicketFilter(mine, 'naoatribuidos', 'c.reis')).toBe(false);
    expect(matchesTicketFilter(free, 'naoatribuidos', 'c.reis')).toBe(true);
    expect(matchesTicketFilter(free, 'urgentes', 'c.reis')).toBe(true);
  });
});
