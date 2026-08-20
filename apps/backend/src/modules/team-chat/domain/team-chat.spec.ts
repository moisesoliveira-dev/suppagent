import { TeamChat } from './team-chat';

describe('TeamChat', () => {
  it('cria canal com nome', () => {
    const chat = TeamChat.createChannel('geral');
    expect(chat.kind).toBe('channel');
    expect(chat.name).toBe('geral');
    expect(chat.messages).toHaveLength(0);
  });

  it('recusa nome vazio', () => {
    expect(() => TeamChat.createChannel('  ')).toThrow('nome');
  });
});
