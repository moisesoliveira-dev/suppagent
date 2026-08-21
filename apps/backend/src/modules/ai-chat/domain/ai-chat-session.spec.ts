import { AiChatSession } from './ai-chat-session';
import { replyToPrompt } from './ai-chat-replies';

describe('AiChatSession', () => {
  it('cria conversa com boas-vindas', () => {
    const session = AiChatSession.create({ ownerHandle: 'c.reis' });
    expect(session.title).toBe('Nova conversa');
    expect(session.messages).toHaveLength(1);
    expect(session.messages[0]?.role).toBe('assistant');
  });

  it('renomeia e auto-titula na primeira mensagem', () => {
    const session = AiChatSession.create({ ownerHandle: 'c.reis' });
    session.appendExchange(
      'qual o sla da categoria financeiro?',
      replyToPrompt('qual o sla da categoria financeiro?'),
    );
    expect(session.messages).toHaveLength(3);
    expect(session.title).toContain('sla');
    session.rename('SLA financeiro');
    expect(session.title).toBe('SLA financeiro');
  });

  it('responde prompts conhecidos', () => {
    expect(replyToPrompt('como funciona o roteamento automático?')).toContain(
      'Confiança',
    );
  });
});
