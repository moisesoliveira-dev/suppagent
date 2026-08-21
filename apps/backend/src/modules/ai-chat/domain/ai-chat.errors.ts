export class AiChatSessionNotFoundError extends Error {
  constructor(id: string) {
    super(`conversa não encontrada: ${id}`);
    this.name = 'AiChatSessionNotFoundError';
  }
}
