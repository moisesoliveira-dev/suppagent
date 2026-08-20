import { ClientsView } from '../clients/ClientsView'
import { DashboardView } from '../dashboard/DashboardView'
import { UserChatView } from '../chat/UserChatView'
import { CannedView } from '../inbox/InboxViews'
import { KnowledgeView } from '../knowledge/KnowledgeView'
import { AutomationsView, ReportsView, SlaView } from '../ops/OpsViews'
import { TeamView } from '../team/TeamView'
import {
  AiChatView,
  AiConfigView,
  AiOverviewView,
  AiRepliesView,
  AiRoutingView,
  CatalogView,
  SettingsView,
} from '../system/SystemViews'
import { TicketsView } from '../tickets/TicketsView'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { navigateTo, useShellNav } from './shell-nav'

export function AppShell() {
  const { view } = useShellNav()

  return (
    <div className="flex h-full bg-bg font-display text-ink">
      <Sidebar active={view} onNavigate={navigateTo} />
      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <div className="view-enter flex min-h-0 flex-1" key={view}>
          {view === 'painel' ? <DashboardView /> : null}
          {view === 'chamados' ? <TicketsView /> : null}
          {view === 'clientes' ? <ClientsView /> : null}
          {view === 'chatusuarios' ? <UserChatView /> : null}
          {view === 'baseconhecimento' ? <KnowledgeView /> : null}
          {view === 'respostasprontas' ? <CannedView /> : null}
          {view === 'sla' ? <SlaView /> : null}
          {view === 'automacoes' ? <AutomationsView /> : null}
          {view === 'equipe' ? <TeamView /> : null}
          {view === 'relatorios' ? <ReportsView /> : null}
          {view === 'cadastros' ? <CatalogView /> : null}
          {view === 'iachat' ? <AiChatView /> : null}
          {view === 'iaagente' ? <AiOverviewView /> : null}
          {view === 'iaroteamento' ? <AiRoutingView /> : null}
          {view === 'iarespostas' ? <AiRepliesView /> : null}
          {view === 'iaconfig' ? <AiConfigView /> : null}
          {view === 'configuracoes' ? <SettingsView /> : null}
        </div>
      </main>
    </div>
  )
}
