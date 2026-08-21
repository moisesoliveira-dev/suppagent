import { RoutingRule } from './routing-rule';

describe('RoutingRule', () => {
  it('normaliza palavras-chave e categoria', () => {
    const rule = RoutingRule.create({
      name: ' Finanças ',
      keywords: [' Reembolso ', 'reembolso', 'cobrança'],
      category: 'Financeiro',
      agentHandle: ' c.reis ',
    });
    expect(rule.category).toBe('financeiro');
    expect(rule.keywords).toEqual(['reembolso', 'cobrança']);
    expect(rule.agentHandle).toBe('c.reis');
  });

  it('exige keywords', () => {
    expect(() =>
      RoutingRule.create({
        name: 'x',
        keywords: ['  '],
        category: 'y',
      }),
    ).toThrow(/palavra-chave/);
  });
});
