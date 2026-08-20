import { useEffect, useState } from 'react'
import {
  ActionBar,
  ActionButton,
  DetailPanel,
  PassLabel,
  PassSub,
  PassTitle,
  RelTicket,
  StubBar,
} from '../../shared/ui/chrome'
import { toast } from '../../shared/ui/toast'
import { navigateTo, openChatForTicket, openTicketFocus } from '../shell/shell-nav'
import { listTickets } from '../tickets/tickets-api'
import { onTicketsChanged } from '../tickets/tickets-ui'
import { listUsers } from '../users/users-api'
import {
  buildTeamMemberSnapshot,
  initialsFromName,
  type TeamMemberSnapshot,
} from './team'

function fillClass(fill: TeamMemberSnapshot['fill']) {
  if (fill === 'high') return 'bg-red'
  if (fill === 'mid') return 'bg-amber'
  return 'bg-green'
}

export function TeamView() {
  const [members, setMembers] = useState<TeamMemberSnapshot[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const users = await listUsers('tecnico')
      const techs = users.items.filter((user) => user.handle)
      const snapshots = await Promise.all(
        techs.map(async (user) => {
          const data = await listTickets({
            filter: 'meus',
            agent: user.handle ?? undefined,
            page: 1,
            pageSize: 50,
          })
          return buildTeamMemberSnapshot(user, data.items)
        }),
      )
      snapshots.sort((a, b) => a.user.name.localeCompare(b.user.name, 'pt-BR'))
      setMembers(snapshots)
      setSelectedId((current) => {
        if (current && snapshots.some((item) => item.user.id === current)) {
          return current
        }
        return snapshots[0]?.user.id ?? null
      })
    } catch (err) {
      setMembers([])
      setSelectedId(null)
      setError(err instanceof Error ? err.message : 'falha ao carregar equipe')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    return onTicketsChanged(() => {
      void load()
    })
  }, [])

  const selected =
    members.find((item) => item.user.id === selectedId) ?? members[0] ?? null

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="border-b border-stroke px-6 py-3">
          <p className="text-[15px] font-bold">equipe</p>
          <p className="text-[11.5px] text-dim">
            técnicos cadastrados e carga atual de chamados abertos
          </p>
        </div>

        {error ? (
          <div className="mx-6 mt-4 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="px-6 py-4 text-xs text-dim">carregando equipe…</div>
        ) : null}

        {!loading && members.length === 0 ? (
          <div className="px-6 py-4 text-xs text-dim">
            nenhum técnico cadastrado. adicione em cadastros → usuários.
          </div>
        ) : null}

        <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(230px,1fr))] content-start gap-3 overflow-y-auto px-6 py-4">
          {members.map((item) => (
            <button
              key={item.user.id}
              type="button"
              onClick={() => setSelectedId(item.user.id)}
              className={`rounded border bg-tile px-4 py-3.5 text-left ${
                selected?.user.id === item.user.id ? 'border-amber' : 'border-stroke'
              }`}
            >
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[3px] border border-stroke bg-board text-xs font-bold text-amber">
                  {initialsFromName(item.user.name)}
                </div>
                <div>
                  <div className="text-[12.5px] font-bold">{item.user.name}</div>
                  <div className="text-[10.5px] text-dim">
                    {item.user.roleLabel} · @{item.user.handle}
                  </div>
                </div>
              </div>
              <div className="mb-1 flex justify-between text-[10px] text-dim">
                <span>carga atual</span>
                <span>
                  {item.openCount}/{item.capacity}
                </span>
              </div>
              <div className="mb-3 h-1.5 overflow-hidden rounded-[3px] bg-board">
                <div
                  className={`h-full rounded-[3px] ${fillClass(item.fill)}`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10.5px] text-dim">
                <span>
                  abertos <b className="text-ink">{item.openCount}</b>
                </span>
                <span>
                  resolvidos <b className="text-ink">{item.resolvedCount}</b>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <DetailPanel>
        {selected ? (
          <>
            <PassLabel>
              {selected.user.roleLabel} · @{selected.user.handle}
            </PassLabel>
            <PassTitle>{selected.user.name}</PassTitle>
            <PassSub>{selected.user.email}</PassSub>
            <StubBar />
            <div className="mb-5">
              <div className="mb-1 flex justify-between text-[10px] text-dim">
                <span>carga de trabalho</span>
                <span>
                  {selected.openCount}/{selected.capacity} abertos
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-[3px] bg-board">
                <div
                  className={`h-full rounded-[3px] ${fillClass(selected.fill)}`}
                  style={{ width: `${selected.percent}%` }}
                />
              </div>
            </div>
            <div className="mb-5 grid grid-cols-2 gap-3">
              <div>
                <PassLabel>chamados abertos</PassLabel>
                <div className="text-[12.5px]">{selected.openCount}</div>
              </div>
              <div>
                <PassLabel>resolvidos (lista)</PassLabel>
                <div className="text-[12.5px]">{selected.resolvedCount}</div>
              </div>
              <div>
                <PassLabel>handle</PassLabel>
                <div className="text-[12.5px]">{selected.user.handle}</div>
              </div>
              <div>
                <PassLabel>capacidade</PassLabel>
                <div className="text-[12.5px]">{selected.capacity}</div>
              </div>
            </div>
            <div className="mb-2 text-[10.5px] tracking-widest text-dim uppercase">
              chamados abertos
            </div>
            {selected.openTickets.length ? (
              selected.openTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => openTicketFocus(ticket.id)}
                  className="block w-full text-left"
                >
                  <RelTicket
                    label={`#${ticket.id} — ${ticket.subject}`}
                    status={ticket.status}
                  />
                </button>
              ))
            ) : (
              <div className="border-b border-stroke py-2 text-xs text-dim">
                nenhum chamado aberto
              </div>
            )}
            <ActionBar>
              <ActionButton
                primary
                onClick={() => {
                  const first = selected.openTickets[0]
                  if (!first) {
                    toast.info('nenhum chamado aberto para abrir no chat')
                    return
                  }
                  openChatForTicket(first.id)
                }}
              >
                abrir no chat
              </ActionButton>
              <ActionButton onClick={() => navigateTo('cadastros')}>
                ir para cadastros
              </ActionButton>
            </ActionBar>
          </>
        ) : (
          <div className="text-xs text-dim">selecione um técnico</div>
        )}
      </DetailPanel>
    </div>
  )
}
