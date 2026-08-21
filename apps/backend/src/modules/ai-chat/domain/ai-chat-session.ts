import { randomUUID } from 'node:crypto';

export type AiChatRole = 'user' | 'assistant';

export type AiChatMessageProps = {
  id: string;
  role: AiChatRole;
  content: string;
  createdAt: Date;
};

export class AiChatSession {
  private constructor(
    private readonly _id: string,
    private _title: string,
    private readonly _ownerHandle: string,
    private _messages: AiChatMessageProps[],
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(input: {
    ownerHandle: string;
    title?: string;
    now?: Date;
  }): AiChatSession {
    const owner = input.ownerHandle.trim().toLowerCase();
    if (!owner) throw new Error('agente é obrigatório');
    const now = input.now ?? new Date();
    const title = (input.title?.trim() || 'Nova conversa').slice(0, 80);
    const welcome: AiChatMessageProps = {
      id: randomUUID(),
      role: 'assistant',
      content:
        'Olá! Posso responder perguntas sobre chamados, clientes, SLA e o funcionamento geral do sistema.',
      createdAt: now,
    };
    return new AiChatSession(
      randomUUID(),
      title,
      owner,
      [welcome],
      now,
      now,
    );
  }

  static reconstitute(props: {
    id: string;
    title: string;
    ownerHandle: string;
    messages: AiChatMessageProps[];
    createdAt: Date;
    updatedAt: Date;
  }): AiChatSession {
    return new AiChatSession(
      props.id,
      props.title,
      props.ownerHandle,
      props.messages,
      props.createdAt,
      props.updatedAt,
    );
  }

  get id() {
    return this._id;
  }
  get title() {
    return this._title;
  }
  get ownerHandle() {
    return this._ownerHandle;
  }
  get messages() {
    return [...this._messages];
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }

  rename(title: string) {
    const next = title.trim().slice(0, 80);
    if (!next) throw new Error('título é obrigatório');
    this._title = next;
    this._updatedAt = new Date();
  }

  appendExchange(userText: string, assistantText: string, now = new Date()) {
    const content = userText.trim();
    if (!content) throw new Error('mensagem é obrigatória');
    const assistant = assistantText.trim();
    if (!assistant) throw new Error('resposta da ia é obrigatória');

    this._messages.push({
      id: randomUUID(),
      role: 'user',
      content,
      createdAt: now,
    });
    this._messages.push({
      id: randomUUID(),
      role: 'assistant',
      content: assistant,
      createdAt: new Date(now.getTime() + 1),
    });

    if (this._title === 'Nova conversa') {
      this._title = content.slice(0, 48) + (content.length > 48 ? '…' : '');
    }
    this._updatedAt = now;
  }
}
