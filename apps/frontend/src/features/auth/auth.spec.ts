import { describe, expect, it } from 'vitest'
import {
  getAppEnv,
  hasFieldErrors,
  isDevAppEnv,
  mapAuthError,
  validateLoginInput,
} from './auth'

describe('auth helpers', () => {
  it('valida e-mail e senha', () => {
    expect(validateLoginInput({ email: '', password: '' })).toEqual({
      email: 'informe seu e-mail',
      password: 'informe sua senha',
    })
    expect(validateLoginInput({ email: 'a@b', password: '123456' }).email).toBe(
      'informe um e-mail válido',
    )
    expect(hasFieldErrors(validateLoginInput({ email: 'a@b.co', password: '123456' }))).toBe(
      false,
    )
  })

  it('traduz erros técnicos em mensagens amigáveis', () => {
    expect(mapAuthError(new Error('Unauthorized'))).toMatch(/e-mail ou senha/i)
    expect(mapAuthError(new Error('404 Not Found'))).toMatch(/ainda não está disponível/i)
    expect(mapAuthError(new Error('Failed to fetch'))).toMatch(/conectar/i)
    expect(mapAuthError(new Error('erro HTTP 500'))).toMatch(/instabilidade/i)
  })

  it('resolve ambiente da aplicação', () => {
    expect(['dev', 'prod']).toContain(getAppEnv())
    expect(typeof isDevAppEnv()).toBe('boolean')
  })
})
