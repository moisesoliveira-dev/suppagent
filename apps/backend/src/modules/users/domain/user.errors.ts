export class UserEmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`e-mail já cadastrado: ${email}`)
  }
}

export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`usuário ${id} não encontrado`)
  }
}
