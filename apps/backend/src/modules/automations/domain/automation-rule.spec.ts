import { AutomationRule } from './automation-rule';

describe('AutomationRule', () => {
  it('cria regra válida', () => {
    const rule = AutomationRule.create({
      name: '  fechar resolvidos  ',
      trigger: 'status = resolvido',
      condition: 'sem resposta nova',
      action: 'fechar chamado',
      authorName: 'camila reis',
    });
    expect(rule.name).toBe('fechar resolvidos');
    expect(rule.enabled).toBe(true);
    expect(rule.runCount).toBe(0);
    expect(rule.lastRunAt).toBeNull();
  });

  it('rejeita campos vazios', () => {
    expect(() =>
      AutomationRule.create({
        name: ' ',
        trigger: 'x',
        condition: 'y',
        action: 'z',
        authorName: 'a',
      }),
    ).toThrow('nome da regra é obrigatório');
  });

  it('alterna enabled e registra execução', () => {
    const rule = AutomationRule.create({
      name: 'alerta',
      trigger: 'novo chamado',
      condition: 'urgente',
      action: 'notificar',
      authorName: 'bruno',
    });
    rule.toggle();
    expect(rule.enabled).toBe(false);
    const at = new Date('2026-08-21T12:00:00Z');
    rule.markRun(at);
    expect(rule.runCount).toBe(1);
    expect(rule.lastRunAt).toEqual(at);
  });
});
