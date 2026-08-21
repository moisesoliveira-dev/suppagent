export class CannedResponseNotFoundError extends Error {
  constructor(id: string) {
    super(`resposta pronta não encontrada: ${id}`);
    this.name = 'CannedResponseNotFoundError';
  }
}

export class CannedShortcutAlreadyExistsError extends Error {
  constructor(shortcut: string) {
    super(`atalho já em uso: ${shortcut}`);
    this.name = 'CannedShortcutAlreadyExistsError';
  }
}
