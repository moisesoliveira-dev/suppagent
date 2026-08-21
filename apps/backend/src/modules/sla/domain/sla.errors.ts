export class SlaPolicyNotFoundError extends Error {
  constructor(priority: string) {
    super(`política de sla não encontrada: ${priority}`);
    this.name = 'SlaPolicyNotFoundError';
  }
}
