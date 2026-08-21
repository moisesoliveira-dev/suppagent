export class ClientNotFoundError extends Error {
  constructor(id: string) {
    super(`cliente não encontrado: ${id}`);
    this.name = 'ClientNotFoundError';
  }
}

export class ClientEmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`e-mail já cadastrado: ${email}`);
    this.name = 'ClientEmailAlreadyExistsError';
  }
}
