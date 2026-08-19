import { formatElapsed, formatOpenedAt, parsePriority } from './ticket-format';

describe('ticket-format', () => {
  const now = new Date('2026-08-19T15:16:00');

  it('formata tempo relativo', () => {
    expect(formatElapsed(new Date('2026-08-19T15:04:00'), now)).toBe('12m');
    expect(formatElapsed(new Date('2026-08-19T14:16:00'), now)).toBe('1h');
    expect(formatElapsed(new Date('2026-08-18T15:16:00'), now)).toBe('1d');
  });

  it('formata aberto em', () => {
    expect(formatOpenedAt(new Date('2026-08-19T12:04:00'), now)).toBe('12:04');
    expect(formatOpenedAt(new Date('2026-08-18T09:00:00'), now)).toBe('ontem');
    expect(formatOpenedAt(new Date('2026-08-17T09:00:00'), now)).toBe('2d');
  });

  it('lê prioridade do painel', () => {
    expect(parsePriority('urgente')).toBe('urgent');
    expect(parsePriority('média')).toBe('medium');
  });
});
