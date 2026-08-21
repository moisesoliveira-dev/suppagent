import { Client } from './client';

describe('Client', () => {
  it('cria cliente normalizando e-mail e tags', () => {
    const client = Client.create({
      name: '  Marina Costa ',
      company: ' Vertex Corp ',
      plan: 'empresa',
      email: 'Marina.Costa@VertexCorp.com',
      phone: ' (11) 98421-0092 ',
      tags: [' Conta Empresa ', 'relatórios', 'conta empresa'],
    });

    expect(client.name).toBe('Marina Costa');
    expect(client.company).toBe('Vertex Corp');
    expect(client.email).toBe('marina.costa@vertexcorp.com');
    expect(client.phone).toBe('(11) 98421-0092');
    expect(client.tags).toEqual(['conta empresa', 'relatórios']);
  });

  it('rejeita e-mail inválido', () => {
    expect(() =>
      Client.create({
        name: 'x',
        plan: 'pro',
        email: 'sem-arroba',
      }),
    ).toThrow(/e-mail/);
  });

  it('atualiza campos', () => {
    const client = Client.create({
      name: 'rafael',
      plan: 'pro',
      email: 'rafael@email.com',
    });
    client.update({
      name: 'rafael nunes',
      plan: 'empresa',
      tags: ['acesso'],
    });
    expect(client.name).toBe('rafael nunes');
    expect(client.plan).toBe('empresa');
    expect(client.tags).toEqual(['acesso']);
  });
});
