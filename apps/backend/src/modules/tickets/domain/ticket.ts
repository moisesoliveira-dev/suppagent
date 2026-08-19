import { randomUUID } from 'node:crypto';
import type { TicketPriority } from './ticket-priority';
import { TicketAlreadyResolvedError } from './ticket.errors';
import type { TicketStatus } from './ticket-status';

export type TicketHistoryEntry = {
  id: string;
  occurredAt: Date;
  text: string;
  isInternalNote: boolean;
};

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

  reply(text: string, isInternalNote: boolean, at = new Date()): void {
    this.assertOpen();
    const trimmed = text.trim();
    if (!trimmed) throw new Error('texto da resposta é obrigatório');
    this._history.push({
      id: randomUUID(),
      occurredAt: at,
      text: trimmed,
      isInternalNote,
    });
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

  private assertOpen(): void {
    if (this._status === 'resolved') {
      throw new TicketAlreadyResolvedError(this._id);
    }
  }
}
