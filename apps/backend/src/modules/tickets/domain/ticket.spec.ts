import { Ticket } from './ticket';
import { TicketAlreadyResolvedError } from './ticket.errors';

const NOW = new Date('2026-08-19T15:16:00.000Z');

function openTicket() {
  return Ticket.open({
    subject: 'erro no relatório',
    priority: 'urgent',
    category: 'financeiro',
    requesterName: 'marina costa',
    requesterEmail: 'marina@acme.com',
    message: 'relatório travando',
    now: NOW,
  });
}

describe('Ticket', () => {
  it('abre chamado sem agente', () => {
    const ticket = openTicket();
    expect(ticket.isNew).toBe(true);
    expect(ticket.status).toBe('open');
    expect(ticket.agentId).toBeNull();
    expect(ticket.history).toHaveLength(1);
  });

  it('recusa assunto vazio', () => {
    expect(() =>
      Ticket.open({
        subject: '  ',
        priority: 'low',
        category: 'bug',
        requesterName: 'a',
        requesterEmail: 'a@a.com',
        message: 'oi',
      }),
    ).toThrow('assunto');
  });

  it('responde, transfere e encerra', () => {
    const ticket = openTicket().withId(4471);
    ticket.reply('já estou vendo', true, NOW);
    expect(ticket.status).toBe('in_progress');
    ticket.transfer('c.reis', NOW);
    ticket.close(NOW);
    expect(ticket.agentId).toBe('c.reis');
    expect(ticket.status).toBe('resolved');
    expect(ticket.history).toHaveLength(4);
  });

  it('assume chamado livre', () => {
    const ticket = openTicket().withId(10);
    ticket.claim('c.reis', NOW);
    expect(ticket.agentId).toBe('c.reis');
    expect(ticket.status).toBe('in_progress');
  });

  it('marca aguardando', () => {
    const ticket = openTicket().withId(11);
    ticket.claim('c.reis', NOW);
    ticket.markWaiting(NOW);
    expect(ticket.status).toBe('waiting');
  });

  it('não altera chamado já encerrado', () => {
    const ticket = openTicket().withId(1);
    ticket.close(NOW);
    expect(() => ticket.reply('oi', false)).toThrow(TicketAlreadyResolvedError);
    expect(() => ticket.transfer('b.alves')).toThrow(TicketAlreadyResolvedError);
    expect(() => ticket.close()).toThrow(TicketAlreadyResolvedError);
  });
});
