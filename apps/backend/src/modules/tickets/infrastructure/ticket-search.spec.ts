import { buildTicketWhere } from './ticket-search';

describe('buildTicketWhere', () => {
  it('busca pelo número do ticket com ou sem #', () => {
    expect(buildTicketWhere('todos', 'c.reis', '4471')).toEqual({
      AND: [
        {},
        {
          OR: expect.arrayContaining([{ id: 4471 }]),
        },
      ],
    });
    expect(buildTicketWhere('todos', 'c.reis', '#4468')).toEqual({
      AND: [
        {},
        {
          OR: expect.arrayContaining([{ id: 4468 }]),
        },
      ],
    });
  });
});
