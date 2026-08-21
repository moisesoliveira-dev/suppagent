import {
  confidenceFromMatch,
  matchKeywords,
  suggestRouting,
} from './routing-engine';

describe('routing-engine', () => {
  const ticket = {
    id: 4482,
    subject: 'não recebi o reembolso do mês passado',
    category: 'geral',
    agentId: null as string | null,
    requesterName: 'marina costa',
    requesterEmail: 'marina@ex.com',
    textBlob: 'não recebi o reembolso do mês passado cobrança',
    priorByCategory: { financeiro: 2 },
  };

  const rules = [
    {
      id: 'r1',
      name: 'financeiro',
      keywords: ['reembolso', 'cobrança'],
      category: 'financeiro',
      agentHandle: 'c.reis',
      enabled: true,
    },
    {
      id: 'r2',
      name: 'acesso',
      keywords: ['login', 'senha'],
      category: 'acesso',
      agentHandle: 'b.alves',
      enabled: true,
    },
  ];

  it('casa palavras-chave', () => {
    expect(matchKeywords('erro de login', ['login', 'senha'])).toEqual([
      'login',
    ]);
  });

  it('sugere regra com maior match e histórico', () => {
    const suggestion = suggestRouting(ticket, rules, {
      'c.reis': 'camila reis',
    });
    expect(suggestion.category).toBe('financeiro');
    expect(suggestion.agentHandle).toBe('c.reis');
    expect(suggestion.tone).toBe('high');
    expect(suggestion.status).toBe('pendente');
    expect(suggestion.signals[0]).toContain('reembolso');
  });

  it('marca revisão quando confiança baixa', () => {
    const suggestion = suggestRouting(
      {
        ...ticket,
        textBlob: 'dúvida sobre cancelamento do plano',
        priorByCategory: {},
      },
      [
        {
          id: 'r3',
          name: 'cancelamento',
          keywords: ['cancelar', 'cancelamento'],
          category: 'indefinido',
          agentHandle: null,
          enabled: true,
        },
      ],
      {},
    );
    expect(suggestion.status).toBe('revisao');
    expect(suggestion.tone).toBe('low');
  });

  it('calcula confiança', () => {
    expect(
      confidenceFromMatch({
        matchedCount: 2,
        priorCategoryCount: 1,
        hasAgent: true,
      }),
    ).toBe(90);
  });
});
