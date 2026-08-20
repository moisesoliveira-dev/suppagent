export class TicketAlreadyResolvedError extends Error {
  constructor(id: number) {
    super(`chamado ${id} já está encerrado`);
  }
}

export class TicketNotResolvedError extends Error {
  constructor(id: number) {
    super(`chamado ${id} não está encerrado`);
  }
}

export class TicketNotFoundError extends Error {
  constructor(id: number) {
    super(`chamado ${id} não encontrado`);
  }
}
