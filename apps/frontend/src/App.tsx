import { AppShell } from './features/shell/AppShell'
import { CreateTicketDialog } from './features/tickets/CreateTicketDialog'
import { ToastHost } from './shared/ui/toast'

function App() {
  return (
    <>
      <AppShell />
      <CreateTicketDialog />
      <ToastHost />
    </>
  )
}

export default App
