export class UserEmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`e-mail já cadastrado: ${email}`);
  }
}

export class UserHandleAlreadyExistsError extends Error {
  constructor(handle: string) {
    super(`identificador já cadastrado: ${handle}`);
  }
}

export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`usuário ${id} não encontrado`);
  }
}
