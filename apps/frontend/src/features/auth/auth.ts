export type LoginInput = {
  email: string
  password: string
  remember: boolean
}

export type AuthUser = {
  email: string
  name: string
  handle?: string | null
}

/** Sessão autenticada (quando `/auth/login` existir). */
export type AuthSession = {
  kind: 'authenticated'
  token: string
  user: AuthUser
}

/** Acesso ao painel enquanto a API de auth não estiver disponível. */
export type AnonymousSession = {
  kind: 'anonymous'
}

export type Session = AuthSession | AnonymousSession

export type FieldErrors = {
  email?: string
  password?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLoginInput(input: {
  email: string
  password: string
}): FieldErrors {
  const errors: FieldErrors = {}
  const email = input.email.trim()
  const password = input.password

  if (!email) errors.email = 'informe seu e-mail'
  else if (!EMAIL_RE.test(email)) errors.email = 'informe um e-mail válido'

  if (!password) errors.password = 'informe sua senha'
  else if (password.length < 6) {
    errors.password = 'a senha deve ter pelo menos 6 caracteres'
  }

  return errors
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Boolean(errors.email || errors.password)
}

/** Converte falhas técnicas em mensagens amigáveis (nunca status HTTP cru). */
export function mapAuthError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'não foi possível entrar. tente novamente.'
  }

  const raw = error.message.trim()
  const lower = raw.toLowerCase()

  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('load failed')
  ) {
    return 'não foi possível conectar ao servidor. verifique sua conexão.'
  }

  if (
    /\b404\b/.test(lower) ||
    lower.includes('not found') ||
    lower.includes('cannot post') ||
    lower.includes('não encontrad')
  ) {
    return 'o serviço de autenticação ainda não está disponível neste ambiente.'
  }

  if (
    /\b401\b/.test(lower) ||
    /\b403\b/.test(lower) ||
    lower.includes('unauthorized') ||
    lower.includes('forbidden') ||
    lower.includes('credenciais') ||
    lower.includes('invalid')
  ) {
    return 'e-mail ou senha incorretos. confira e tente de novo.'
  }

  if (/\b429\b/.test(lower) || lower.includes('too many')) {
    return 'muitas tentativas. aguarde um momento e tente novamente.'
  }

  if (/\b5\d{2}\b/.test(lower) || lower.includes('erro http 5')) {
    return 'estamos com instabilidade no momento. tente novamente em instantes.'
  }

  if (raw.length > 0 && raw.length < 120 && !/\b\d{3}\b/.test(raw)) {
    return raw
  }

  return 'não foi possível entrar. tente novamente.'
}

export function isAuthRequired(): boolean {
  return import.meta.env.VITE_AUTH_REQUIRED !== 'false'
}

export const REMEMBER_EMAIL_KEY = 'balcao.remember.email'
