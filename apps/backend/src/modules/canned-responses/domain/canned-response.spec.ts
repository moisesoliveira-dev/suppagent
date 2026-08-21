import {
  CannedResponse,
  extractVariables,
  normalizeShortcut,
} from './canned-response';

describe('CannedResponse', () => {
  it('cria modelo com atalho normalizado e variáveis', () => {
    const response = CannedResponse.create({
      title: 'saudação',
      category: 'Saudacao',
      shortcut: 'ola',
      body: 'Olá {{nome_cliente}}! Sou {{agente}}.',
    });
    expect(response.shortcut).toBe('/ola');
    expect(response.category).toBe('saudacao');
    expect(response.variables).toEqual(['nome_cliente', 'agente']);
  });

  it('rejeita atalho inválido', () => {
    expect(() => normalizeShortcut('olá!')).toThrow(/atalho/);
  });

  it('extrai variáveis únicas', () => {
    expect(extractVariables('{{a}} e {{b}} e {{a}}')).toEqual(['a', 'b']);
  });

  it('duplica e registra uso', () => {
    const response = CannedResponse.create({
      title: 'senha',
      category: 'acesso',
      shortcut: '/senha',
      body: 'reset em {{tempo_expiracao}} min',
    });
    response.markUsed();
    expect(response.useCount).toBe(1);
    const copy = response.duplicate();
    expect(copy.title).toContain('cópia');
    expect(copy.shortcut).toBe('/senha-copia');
    expect(copy.useCount).toBe(0);
  });
});
