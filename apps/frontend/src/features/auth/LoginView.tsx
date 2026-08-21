import { useEffect, useId, useState, type FormEvent } from 'react'
import { toast } from '../../shared/ui/toast'
import { signIn } from './auth-api'
import {
  REMEMBER_EMAIL_KEY,
  hasFieldErrors,
  mapAuthError,
  validateLoginInput,
  type FieldErrors,
} from './auth'
import { enterAnonymousSession, setSession } from './auth-session'

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6.5h16v11H4v-11Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m4.5 7 7.5 6 7.5-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 10V7.5a4 4 0 0 1 8 0V10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 3l18 18M10.5 10.5a2.5 2.5 0 0 0 3 3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M9.9 5.2A10.5 10.5 0 0 1 12 5c5 0 9 4.5 10.5 7-.5.9-1.4 2.2-2.7 3.4M6.1 6.1C4.4 7.4 3.2 9 2.5 12 4 14.5 8 19 12 19c1.2 0 2.4-.3 3.5-.8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12C4 9.5 8 5 12 5s8 4.5 9.5 7c-1.5 2.5-5.5 7-9.5 7s-8-4.5-9.5-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

const inputBase =
  'w-full rounded-lg border bg-board py-3 pr-3 pl-10 text-[13px] text-ink transition-colors outline-none placeholder:text-dim/80 focus:border-amber focus:ring-2 focus:ring-amber/25 disabled:opacity-50'

export function LoginView() {
  const emailId = useId()
  const passwordId = useId()
  const rememberId = useId()
  const formErrorId = useId()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [authUnavailable, setAuthUnavailable] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_EMAIL_KEY)
      if (saved) {
        setEmail(saved)
        setRemember(true)
      }
    } catch {
      /* ignore */
    }
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (loading) return

    const nextErrors = validateLoginInput({ email, password })
    setFieldErrors(nextErrors)
    setFormError(null)
    setAuthUnavailable(false)
    if (hasFieldErrors(nextErrors)) return

    setLoading(true)
    try {
      const session = await signIn({
        email,
        password,
        remember,
      })
      if (remember) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim())
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY)
      }
      setSession(session)
      toast.success('login realizado')
    } catch (err) {
      const message = mapAuthError(err)
      setFormError(message)
      if (message.includes('ainda não está disponível')) {
        setAuthUnavailable(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-y-auto bg-bg px-4 py-8 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in srgb, var(--color-amber) 18%, transparent), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, color-mix(in srgb, var(--color-blue) 10%, transparent), transparent 50%)',
        }}
        aria-hidden="true"
      />

      <div className="view-enter relative w-full max-w-[420px]">
        <div className="rounded-2xl border border-stroke bg-panel/95 p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.75)] backdrop-blur-sm sm:p-8">
          <div className="mb-7 flex flex-col items-center text-center">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-amber text-base font-bold text-amber-ink shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-amber)_18%,transparent)]">
              #
            </div>
            <div className="mb-5 text-[13px] font-bold tracking-[0.2em] text-amber uppercase">
              Balcão
            </div>
            <h1 className="mb-2 text-[22px] leading-tight font-bold tracking-tight text-ink sm:text-[24px]">
              Bem-vindo de volta!
            </h1>
            <p className="max-w-[28ch] text-[12.5px] leading-relaxed text-dim">
              Entre na sua conta para continuar.
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
            {formError ? (
              <div
                id={formErrorId}
                role="alert"
                className="rounded-lg border border-red/40 bg-tile px-3.5 py-3 text-[12px] leading-relaxed text-red"
              >
                {formError}
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={emailId}
                className="text-[10px] tracking-widest text-dim uppercase"
              >
                E-mail
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-dim">
                  <MailIcon />
                </span>
                <input
                  id={emailId}
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="seu@email.com"
                  value={email}
                  disabled={loading}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? `${emailId}-error` : undefined
                  }
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (fieldErrors.email) {
                      setFieldErrors((current) => ({ ...current, email: undefined }))
                    }
                  }}
                  className={`${inputBase} ${
                    fieldErrors.email
                      ? 'border-red focus:border-red focus:ring-red/20'
                      : 'border-stroke'
                  }`}
                />
              </div>
              {fieldErrors.email ? (
                <p id={`${emailId}-error`} className="text-[11px] text-red">
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={passwordId}
                className="text-[10px] tracking-widest text-dim uppercase"
              >
                Senha
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-dim">
                  <LockIcon />
                </span>
                <input
                  id={passwordId}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  value={password}
                  disabled={loading}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? `${passwordId}-error` : undefined
                  }
                  onChange={(event) => {
                    setPassword(event.target.value)
                    if (fieldErrors.password) {
                      setFieldErrors((current) => ({
                        ...current,
                        password: undefined,
                      }))
                    }
                  }}
                  className={`${inputBase} pr-11 ${
                    fieldErrors.password
                      ? 'border-red focus:border-red focus:ring-red/20'
                      : 'border-stroke'
                  }`}
                />
                <button
                  type="button"
                  tabIndex={0}
                  disabled={loading}
                  aria-label={showPassword ? 'ocultar senha' : 'mostrar senha'}
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1.5 text-dim transition-colors hover:bg-tile hover:text-ink focus-visible:ring-2 focus-visible:ring-amber/40 focus-visible:outline-none disabled:opacity-50"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {fieldErrors.password ? (
                <p id={`${passwordId}-error`} className="text-[11px] text-red">
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
              <label
                htmlFor={rememberId}
                className="flex cursor-pointer items-center gap-2 text-[12px] text-dim select-none"
              >
                <input
                  id={rememberId}
                  type="checkbox"
                  checked={remember}
                  disabled={loading}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 accent-amber"
                />
                Lembrar de mim
              </label>
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  toast.info(
                    'a recuperação de senha estará disponível quando a autenticação for ativada.',
                  )
                }
                className="text-[12px] text-amber transition-colors hover:text-ink focus-visible:underline focus-visible:outline-none disabled:opacity-50"
              >
                Esqueci minha senha
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              aria-describedby={formError ? formErrorId : undefined}
              className="mt-1 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-amber px-4 py-3 text-[12px] font-bold tracking-wide text-amber-ink uppercase transition-all hover:brightness-110 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-amber/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-ink/30 border-t-amber-ink"
                    aria-hidden="true"
                  />
                  entrando…
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {authUnavailable ? (
            <div className="mt-4 rounded-lg border border-dashed border-stroke bg-board/60 px-3.5 py-3 text-center">
              <p className="mb-2.5 text-[11.5px] leading-relaxed text-dim">
                o backend de login ainda não foi publicado. você pode seguir para o
                painel neste ambiente.
              </p>
              <button
                type="button"
                onClick={() => {
                  enterAnonymousSession()
                  toast.info('painel aberto sem autenticação')
                }}
                className="text-[11.5px] font-bold tracking-wide text-amber uppercase transition-colors hover:text-ink focus-visible:underline focus-visible:outline-none"
              >
                continuar para o painel
              </button>
            </div>
          ) : null}

          <p className="mt-7 text-center text-[12px] text-dim">
            Ainda não tem uma conta?{' '}
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                toast.info(
                  'o cadastro público estará disponível quando a autenticação for ativada.',
                )
              }
              className="font-bold text-amber transition-colors hover:text-ink focus-visible:underline focus-visible:outline-none disabled:opacity-50"
            >
              Criar conta
            </button>
          </p>
        </div>

        <p className="mt-5 text-center text-[10px] tracking-widest text-dim uppercase">
          SuppAgent · atendimento
        </p>
      </div>
    </div>
  )
}
