import { AppShell } from './features/shell/AppShell'
import { CreateTicketDialog } from './features/tickets/CreateTicketDialog'
import { ContextMenuHost } from './shared/ui/context-menu'
import { ToastHost } from './shared/ui/toast'

function App() {
  return (
    <>
      <AppShell />
      <CreateTicketDialog />
      <ToastHost />
      <ContextMenuHost />
    </>
  )
}

export default App
