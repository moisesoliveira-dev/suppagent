export class RoutingRuleNotFoundError extends Error {
  constructor(id: string) {
    super(`regra de roteamento não encontrada: ${id}`);
    this.name = 'RoutingRuleNotFoundError';
  }
}

export class RoutingTicketNotFoundError extends Error {
  constructor(id: number) {
    super(`chamado não encontrado para roteamento: ${id}`);
    this.name = 'RoutingTicketNotFoundError';
  }
}
