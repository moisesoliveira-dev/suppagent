import { apiRequest } from '../../shared/api/http'
import type { AuthSession, AuthUser, LoginInput } from './auth'

type LoginResponse = {
  token?: string
  accessToken?: string
  user?: {
    email?: string
    name?: string
    handle?: string | null
  }
}

/**
 * Integração com a API de autenticação.
 * Endpoint esperado (ainda não existe no backend): `POST /auth/login`
 * body: `{ email, password }`
 * resposta: `{ token, user: { email, name, handle? } }`
 */
export async function signIn(input: LoginInput): Promise<AuthSession> {
  const body = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email.trim(),
      password: input.password,
    }),
  })

  const token = body.token ?? body.accessToken
  const email = body.user?.email?.trim() || input.email.trim()
  const name = body.user?.name?.trim() || email
  if (!token) {
    throw new Error('resposta de autenticação incompleta')
  }

  const user: AuthUser = {
    email,
    name,
    handle: body.user?.handle ?? null,
  }

  return { kind: 'authenticated', token, user }
}
