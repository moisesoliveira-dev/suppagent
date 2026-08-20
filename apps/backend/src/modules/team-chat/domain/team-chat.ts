import { randomUUID } from 'node:crypto';

export type TeamChatMessage = {
  id: string;
  occurredAt: Date;
  text: string;
  authorHandle: string;
  authorName: string;
  deletedAt: Date | null;
  editedAt: Date | null;
  pinnedAt: Date | null;
  replyToId: string | null;
  forwardedFromName: string | null;
};

export type TeamChatKind = 'channel' | 'direct';

export class TeamChat {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private readonly _kind: TeamChatKind,
    private readonly _createdAt: Date,
    private _messages: TeamChatMessage[],
  ) {}

  static createChannel(name: string, now = new Date()): TeamChat {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('nome do chat é obrigatório');
    return new TeamChat(randomUUID(), trimmed, 'channel', now, []);
  }

  static reconstitute(props: {
    id: string;
    name: string;
    kind: TeamChatKind;
    createdAt: Date;
    messages: TeamChatMessage[];
  }): TeamChat {
    return new TeamChat(
      props.id,
      props.name,
      props.kind,
      props.createdAt,
      props.messages.map((message) => ({ ...message })),
    );
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get kind(): TeamChatKind {
    return this._kind;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get messages(): TeamChatMessage[] {
    return this._messages.map((message) => ({ ...message }));
  }

  post(
    text: string,
    author: { handle: string; name: string },
    at = new Date(),
    replyToId?: string | null,
  ): void {
    const trimmed = text.trim();
    if (!trimmed) throw new Error('texto da mensagem é obrigatório');
    let replyRef: string | null = null;
    if (replyToId) {
      const target = this.requireMessage(replyToId);
      if (target.deletedAt) throw new Error('não é possível responder mensagem apagada');
      replyRef = target.id;
    }
    this._messages.push({
      id: randomUUID(),
      occurredAt: at,
      text: trimmed,
      authorHandle: author.handle.trim(),
      authorName: author.name.trim(),
      deletedAt: null,
      editedAt: null,
      pinnedAt: null,
      replyToId: replyRef,
      forwardedFromName: null,
    });
  }

  editMessage(messageId: string, text: string, at = new Date()): void {
    const entry = this.requireMessage(messageId);
    if (entry.deletedAt) throw new Error('mensagem apagada não pode ser editada');
    const trimmed = text.trim();
    if (!trimmed) throw new Error('texto da mensagem é obrigatório');
    entry.text = trimmed;
    entry.editedAt = at;
  }

  deleteMessage(messageId: string, at = new Date()): void {
    const entry = this.requireMessage(messageId);
    if (entry.deletedAt) throw new Error('mensagem já está apagada');
    entry.deletedAt = at;
    entry.pinnedAt = null;
  }

  togglePinMessage(messageId: string, at = new Date()): void {
    const entry = this.requireMessage(messageId);
    if (entry.deletedAt) throw new Error('mensagem apagada não pode ser fixada');
    entry.pinnedAt = entry.pinnedAt ? null : at;
  }

  receiveForwarded(input: {
    text: string;
    fromName: string;
    author: { handle: string; name: string };
    at?: Date;
  }): void {
    const trimmed = input.text.trim();
    const fromName = input.fromName.trim();
    if (!trimmed) throw new Error('texto da mensagem é obrigatório');
    if (!fromName) throw new Error('nome de origem do encaminhamento é obrigatório');
    this._messages.push({
      id: randomUUID(),
      occurredAt: input.at ?? new Date(),
      text: trimmed,
      authorHandle: input.author.handle.trim(),
      authorName: input.author.name.trim(),
      deletedAt: null,
      editedAt: null,
      pinnedAt: null,
      replyToId: null,
      forwardedFromName: fromName,
    });
  }

  private requireMessage(messageId: string): TeamChatMessage {
    const entry = this._messages.find((item) => item.id === messageId);
    if (!entry) throw new Error('mensagem não encontrada');
    return entry;
  }
}
