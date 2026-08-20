import { randomUUID } from 'node:crypto';
import type { TicketPriority } from './ticket-priority';
import {
  TicketAlreadyResolvedError,
  TicketNotResolvedError,
} from './ticket.errors';
import type { TicketStatus } from './ticket-status';

export type TicketEventAuthor = 'requester' | 'agent';

export type TicketHistoryEntry = {
  id: string;
  occurredAt: Date;
  text: string;
  isInternalNote: boolean;
  author: TicketEventAuthor;
  deletedAt: Date | null;
  editedAt: Date | null;
  pinnedAt: Date | null;
  replyToId: string | null;
  forwardedFromName: string | null;
};

function emptyMeta(): Pick<
  TicketHistoryEntry,
  | 'deletedAt'
  | 'editedAt'
  | 'pinnedAt'
  | 'replyToId'
  | 'forwardedFromName'
> {
  return {
    deletedAt: null,
    editedAt: null,
    pinnedAt: null,
    replyToId: null,
    forwardedFromName: null,
  };
}

export type OpenTicketInput = {
  subject: string;
  priority: TicketPriority;
  category: string;
  requesterName: string;
  requesterEmail: string;
  message: string;
  now?: Date;
};

export class Ticket {
  private constructor(
    private readonly _id: number,
    private _subject: string,
    private _status: TicketStatus,
    private _priority: TicketPriority,
    private _agentId: string | null,
    private _category: string,
    private _requesterName: string,
    private _requesterEmail: string,
    private readonly _createdAt: Date,
    private _history: TicketHistoryEntry[],
  ) {}

  static open(input: OpenTicketInput): Ticket {
    const now = input.now ?? new Date();
    const subject = input.subject.trim();
    const message = input.message.trim();
    if (!subject) throw new Error('assunto do chamado é obrigatório');
    if (!message) throw new Error('mensagem inicial do chamado é obrigatória');

    return new Ticket(
      0,
      subject,
      'open',
      input.priority,
      null,
      input.category.trim(),
      input.requesterName.trim(),
      input.requesterEmail.trim(),
      now,
      [
        {
          id: randomUUID(),
          occurredAt: now,
          text: message,
          isInternalNote: false,
          author: 'requester',
          ...emptyMeta(),
        },
      ],
    );
  }

  static reconstitute(props: {
    id: number;
    subject: string;
    status: TicketStatus;
    priority: TicketPriority;
    agentId: string | null;
    category: string;
    requesterName: string;
    requesterEmail: string;
    createdAt: Date;
    history: TicketHistoryEntry[];
  }): Ticket {
    return new Ticket(
      props.id,
      props.subject,
      props.status,
      props.priority,
      props.agentId,
      props.category,
      props.requesterName,
      props.requesterEmail,
      props.createdAt,
      [...props.history],
    );
  }

  get id(): number {
    return this._id;
  }

  get isNew(): boolean {
    return this._id === 0;
  }

  get subject(): string {
    return this._subject;
  }

  get status(): TicketStatus {
    return this._status;
  }

  get priority(): TicketPriority {
    return this._priority;
  }

  get agentId(): string | null {
    return this._agentId;
  }

  get category(): string {
    return this._category;
  }

  get requesterName(): string {
    return this._requesterName;
  }

  get requesterEmail(): string {
    return this._requesterEmail;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get history(): TicketHistoryEntry[] {
    return [...this._history];
  }

  reply(
    text: string,
    isInternalNote: boolean,
    at = new Date(),
    replyToId?: string | null,
  ): void {
    this.assertOpen();
    const trimmed = text.trim();
    if (!trimmed) throw new Error('texto da resposta é obrigatório');
    let replyRef: string | null = null;
    if (replyToId) {
      const target = this.requireMessage(replyToId);
      if (target.deletedAt) throw new Error('não é possível responder mensagem apagada');
      replyRef = target.id;
    }
    this._history.push({
      id: randomUUID(),
      occurredAt: at,
      text: trimmed,
      isInternalNote,
      author: 'agent',
      ...emptyMeta(),
      replyToId: replyRef,
    });
    if (this._status === 'open') {
      this._status = 'in_progress';
    }
  }

  editMessage(messageId: string, text: string, at = new Date()): void {
    this.assertOpen();
    const entry = this.requireMessage(messageId);
    if (entry.deletedAt) throw new Error('mensagem apagada não pode ser editada');
    if (entry.isInternalNote) throw new Error('nota interna não pode ser editada pelo chat');
    const trimmed = text.trim();
    if (!trimmed) throw new Error('texto da mensagem é obrigatório');
    entry.text = trimmed;
    entry.editedAt = at;
  }

  deleteMessage(messageId: string, at = new Date()): void {
    this.assertOpen();
    const entry = this.requireMessage(messageId);
    if (entry.deletedAt) throw new Error('mensagem já está apagada');
    if (entry.isInternalNote) throw new Error('nota interna não pode ser apagada pelo chat');
    entry.deletedAt = at;
    entry.pinnedAt = null;
  }

  togglePinMessage(messageId: string, at = new Date()): void {
    this.assertOpen();
    const entry = this.requireMessage(messageId);
    if (entry.deletedAt) throw new Error('mensagem apagada não pode ser fixada');
    if (entry.isInternalNote) throw new Error('nota interna não pode ser fixada');
    entry.pinnedAt = entry.pinnedAt ? null : at;
  }

  receiveForwarded(input: {
    text: string;
    fromName: string;
    at?: Date;
  }): void {
    this.assertOpen();
    const trimmed = input.text.trim();
    const fromName = input.fromName.trim();
    if (!trimmed) throw new Error('texto da mensagem é obrigatório');
    if (!fromName) throw new Error('nome de origem do encaminhamento é obrigatório');
    const at = input.at ?? new Date();
    this._history.push({
      id: randomUUID(),
      occurredAt: at,
      text: trimmed,
      isInternalNote: false,
      author: 'agent',
      ...emptyMeta(),
      forwardedFromName: fromName,
    });
    if (this._status === 'open') {
      this._status = 'in_progress';
    }
  }

  authorDisplayName(entry: TicketHistoryEntry): string {
    if (entry.author === 'requester') return this._requesterName;
    return this._agentId ?? 'agente';
  }

  transfer(agentId: string | null, at = new Date()): void {
    this.assertOpen();
    const next = agentId?.trim() ? agentId.trim() : null;
    this._agentId = next;
    this._history.push({
      id: randomUUID(),
      occurredAt: at,
      text: next
        ? `chamado transferido para ${next}.`
        : 'chamado desatribuído.',
      isInternalNote: true,
      author: 'agent',
      ...emptyMeta(),
    });
    if (next && this._status === 'open') {
      this._status = 'in_progress';
    }
  }

  claim(agentId: string, at = new Date()): void {
    const next = agentId.trim();
    if (!next) throw new Error('agente é obrigatório para assumir');
    this.assertOpen();
    this._agentId = next;
    if (this._status === 'open') {
      this._status = 'in_progress';
    }
    this._history.push({
      id: randomUUID(),
      occurredAt: at,
      text: `chamado assumido por ${next}.`,
      isInternalNote: true,
      author: 'agent',
      ...emptyMeta(),
    });
  }

  markWaiting(at = new Date()): void {
    this.assertOpen();
    this._status = 'waiting';
    this._history.push({
      id: randomUUID(),
      occurredAt: at,
      text: 'aguardando resposta do solicitante.',
      isInternalNote: true,
      author: 'agent',
      ...emptyMeta(),
    });
  }

  close(at = new Date()): void {
    this.assertOpen();
    this._status = 'resolved';
    this._history.push({
      id: randomUUID(),
      occurredAt: at,
      text: 'chamado encerrado.',
      isInternalNote: false,
      author: 'agent',
      ...emptyMeta(),
    });
  }

  reopen(reason: string, at = new Date()): void {
    if (this._status !== 'resolved') {
      throw new TicketNotResolvedError(this._id);
    }
    const trimmed = reason.trim();
    if (!trimmed) throw new Error('justificativa da reabertura é obrigatória');
    this._status = this._agentId ? 'in_progress' : 'open';
    this._history.push({
      id: randomUUID(),
      occurredAt: at,
      text: `chamado reaberto: ${trimmed}`,
      isInternalNote: false,
      author: 'agent',
      ...emptyMeta(),
    });
  }

  withId(id: number): Ticket {
    return Ticket.reconstitute({
      id,
      subject: this._subject,
      status: this._status,
      priority: this._priority,
      agentId: this._agentId,
      category: this._category,
      requesterName: this._requesterName,
      requesterEmail: this._requesterEmail,
      createdAt: this._createdAt,
      history: this._history,
    });
  }

  private requireMessage(messageId: string): TicketHistoryEntry {
    const entry = this._history.find((item) => item.id === messageId);
    if (!entry) throw new Error('mensagem não encontrada');
    return entry;
  }

  private assertOpen(): void {
    if (this._status === 'resolved') {
      throw new TicketAlreadyResolvedError(this._id);
    }
  }
}
