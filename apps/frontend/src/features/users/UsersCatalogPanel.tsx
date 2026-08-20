import { useEffect, useState, type FormEvent } from 'react'
import { createUser, deleteUser, listUsers } from './users-api'
import { USER_ROLE_OPTIONS, type User, type UserRole } from './users'

export function UsersCatalogPanel() {
  const [items, setItems] = useState<User[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('usuario')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await listUsers()
      setItems(data.items)
    } catch (err) {
      setItems([])
      setError(err instanceof Error ? err.message : 'falha ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      await createUser({ name, email, role })
      setName('')
      setEmail('')
      setRole('usuario')
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'falha ao cadastrar')
    } finally {
      setBusy(false)
    }
  }

  async function onRemove(user: User) {
    if (!window.confirm(`remover ${user.name}?`)) return
    setBusy(true)
    setError(null)
    try {
      await deleteUser(user.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'falha ao remover')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-[620px]">
      <p className="mb-1 text-[15px] font-bold">usuários</p>
      <p className="mb-6 text-[11.5px] text-dim">
        cadastre pessoas e defina o perfil: usuário normal ou técnico
      </p>

      {error ? (
        <div className="mb-3 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mb-3 text-xs text-dim">carregando usuários…</div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="mb-3 text-xs text-dim">nenhum usuário cadastrado</div>
      ) : null}

      {items.map((user) => (
        <div
          key={user.id}
          className="mb-2 flex max-w-[560px] items-center justify-between rounded border border-stroke bg-tile px-4 py-3"
        >
          <div>
            <div className="mb-0.5 text-[12.5px] font-bold">{user.name}</div>
            <div className="text-[10.5px] text-dim">
              {user.email} · perfil {user.roleLabel}
            </div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onRemove(user)}
            className="rounded-[3px] border border-stroke px-2.5 py-1.5 text-[10.5px] text-dim uppercase hover:border-red hover:text-red disabled:opacity-50"
          >
            remover
          </button>
        </div>
      ))}

      {showForm ? (
        <form
          onSubmit={(event) => void onSubmit(event)}
          className="mt-3 max-w-[560px] rounded border border-stroke bg-tile px-4 py-4"
        >
          <div className="mb-3">
            <label className="mb-1.5 block text-[10px] tracking-widest text-dim uppercase">
              nome
            </label>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-[3px] border border-stroke bg-board px-3 py-2 text-[12.5px] text-ink"
              placeholder="nome completo"
            />
          </div>
          <div className="mb-3">
            <label className="mb-1.5 block text-[10px] tracking-widest text-dim uppercase">
              e-mail
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-[3px] border border-stroke bg-board px-3 py-2 text-[12.5px] text-ink"
              placeholder="email@empresa.com"
            />
          </div>
          <div className="mb-4">
            <div className="mb-1.5 text-[10px] tracking-widest text-dim uppercase">
              perfil
            </div>
            <div className="flex gap-2">
              {USER_ROLE_OPTIONS.map((option) => {
                const active = role === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setRole(option.id)}
                    className={`rounded-[3px] border px-3.5 py-2 text-[11px] font-bold tracking-wide uppercase ${
                      active
                        ? 'border-amber bg-board text-amber'
                        : 'border-stroke bg-board text-dim hover:text-ink'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-[3px] border border-amber bg-amber py-2 text-[10.5px] font-bold tracking-widest text-amber-ink uppercase disabled:opacity-50"
            >
              {busy ? 'salvando…' : 'salvar'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-[3px] border border-stroke bg-board py-2 text-[10.5px] tracking-widest text-ink uppercase"
            >
              cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-1.5 w-full max-w-[560px] rounded-[3px] border border-dashed border-stroke py-2 text-[11px] text-dim uppercase hover:border-amber hover:text-amber"
        >
          + novo usuário
        </button>
      )}
    </div>
  )
}
