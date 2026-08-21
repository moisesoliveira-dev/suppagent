import {
  addMinutes,
  compliancePercent,
  computeResolutionClock,
  computeResponseClock,
  formatDuration,
  isSlaCompliant,
} from './sla-clock';

describe('sla-clock', () => {
  const openedAt = new Date('2026-08-20T12:00:00Z');

  it('marca resposta cumprida dentro do prazo', () => {
    const clock = computeResponseClock({
      openedAt,
      firstAgentReplyAt: new Date('2026-08-20T12:08:00Z'),
      targetMinutes: 15,
      now: new Date('2026-08-20T12:30:00Z'),
    });
    expect(clock.tone).toBe('ok');
    expect(clock.shortLabel).toBe('cumprida');
    expect(clock.detailText).toContain('8min');
  });

  it('marca resposta vencida sem reply', () => {
    const clock = computeResponseClock({
      openedAt,
      firstAgentReplyAt: null,
      targetMinutes: 15,
      now: new Date('2026-08-20T12:20:00Z'),
    });
    expect(clock.tone).toBe('breach');
    expect(clock.shortLabel).toBe('vencida');
  });

  it('avisa quando resta pouco do prazo de resolução', () => {
    const clock = computeResolutionClock({
      openedAt,
      resolvedAt: null,
      targetMinutes: 240,
      now: addMinutes(openedAt, 230),
    });
    expect(clock.tone).toBe('warn');
    expect(clock.shortLabel).toContain('restam');
  });

  it('calcula compliance e duração', () => {
    expect(formatDuration(90 * 60_000)).toBe('1h 30min');
    expect(compliancePercent(9, 10)).toBe(90);
    expect(
      isSlaCompliant(
        computeResponseClock({
          openedAt,
          firstAgentReplyAt: addMinutes(openedAt, 5),
          targetMinutes: 15,
        }),
        computeResolutionClock({
          openedAt,
          resolvedAt: null,
          targetMinutes: 240,
          now: addMinutes(openedAt, 10),
        }),
      ),
    ).toBe(true);
  });
});
