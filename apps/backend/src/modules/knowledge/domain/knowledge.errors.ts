export class KnowledgeArticleNotFoundError extends Error {
  constructor(id: string) {
    super(`artigo ${id} não encontrado`);
    this.name = 'KnowledgeArticleNotFoundError';
  }
}

export class TicketNotClosedForKnowledgeError extends Error {
  constructor(ticketId: number) {
    super(
      `só é possível criar artigo a partir do chamado #${ticketId} quando ele estiver encerrado`,
    );
    this.name = 'TicketNotClosedForKnowledgeError';
  }
}

export class TicketSourceNotFoundError extends Error {
  constructor(ticketId: number) {
    super(`chamado #${ticketId} não encontrado`);
    this.name = 'TicketSourceNotFoundError';
  }
}

export class KnowledgeFromTicketAlreadyExistsError extends Error {
  constructor(ticketId: number) {
    super(`já existe artigo na base para o chamado #${ticketId}`);
    this.name = 'KnowledgeFromTicketAlreadyExistsError';
  }
}
