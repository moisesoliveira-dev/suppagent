import { Test } from '@nestjs/testing';
import { Ticket } from '../domain/ticket';
import { TICKET_REPOSITORY } from '../domain/ticket.repository';
import { ListTicketsService } from './list-tickets.service';

describe('ListTicketsService', () => {
  it('lista pelo filtro e devolve contagens', async () => {
    const open = Ticket.open({
      subject: 'a',
      priority: 'urgent',
      category: 'acesso',
      requesterName: 'x',
      requesterEmail: 'x@x.com',
      message: 'help',
    }).withId(1);

    const findMany = jest.fn().mockResolvedValue([open]);
    const counts = jest.fn().mockResolvedValue({
      todos: 10,
      meus: 4,
      naoatribuidos: 3,
      urgentes: 3,
    });

    const module = await Test.createTestingModule({
      providers: [
        ListTicketsService,
        {
          provide: TICKET_REPOSITORY,
          useValue: { findMany, counts },
        },
      ],
    }).compile();

    const result = await module.get(ListTicketsService).execute({
      filter: 'urgentes',
    });

    expect(findMany).toHaveBeenCalledWith('urgentes', 'c.reis');
    expect(result.items).toHaveLength(1);
    expect(result.counts.urgentes).toBe(3);
  });
});
