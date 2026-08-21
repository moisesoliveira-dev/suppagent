export class AutomationRuleNotFoundError extends Error {
  constructor(id: string) {
    super(`regra de automação não encontrada: ${id}`);
    this.name = 'AutomationRuleNotFoundError';
  }
}
