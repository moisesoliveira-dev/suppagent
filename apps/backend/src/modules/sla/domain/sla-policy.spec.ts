import { SlaPolicy } from './sla-policy';

describe('SlaPolicy', () => {
  function make() {
    return SlaPolicy.reconstitute({
      id: 'p1',
      priority: 'urgent',
      responseMinutes: 15,
      resolutionMinutes: 240,
      createdAt: new Date('2026-08-01T00:00:00Z'),
      updatedAt: new Date('2026-08-01T00:00:00Z'),
    });
  }

  it('atualiza metas válidas', () => {
    const policy = make();
    policy.updateTargets({ responseMinutes: 20, resolutionMinutes: 300 });
    expect(policy.responseMinutes).toBe(20);
    expect(policy.resolutionMinutes).toBe(300);
  });

  it('rejeita resolução menor que resposta', () => {
    expect(() =>
      make().updateTargets({ responseMinutes: 30, resolutionMinutes: 10 }),
    ).toThrow(/resolução/);
  });
});
