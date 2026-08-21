import { allowsNotificationType } from './notification';

describe('allowsNotificationType', () => {
  it('respeita preferências assigned e sla', () => {
    expect(
      allowsNotificationType(
        { assigned: true, sla: false },
        'ticket_assigned',
      ),
    ).toBe(true);
    expect(
      allowsNotificationType(
        { assigned: false, sla: true },
        'ticket_assigned',
      ),
    ).toBe(false);
    expect(
      allowsNotificationType({ assigned: true, sla: false }, 'ticket_urgent'),
    ).toBe(false);
    expect(
      allowsNotificationType({ assigned: false, sla: true }, 'ticket_opened'),
    ).toBe(true);
  });
});
