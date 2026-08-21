import { AppShell } from './features/shell/AppShell'
import { CreateTicketDialog } from './features/tickets/CreateTicketDialog'
import { LoginView } from './features/auth/LoginView'
import { isAuthRequired } from './features/auth/auth'
import { useAuthSession } from './features/auth/auth-session'
import { ContextMenuHost } from './shared/ui/context-menu'
import { ToastHost } from './shared/ui/toast'

function App() {
  const session = useAuthSession()
  const showLogin = isAuthRequired() && !session

  return (
    <>
      {showLogin ? <LoginView /> : <AppShell />}
      {!showLogin ? <CreateTicketDialog /> : null}
      <ToastHost />
      <ContextMenuHost />
    </>
  )
}

export default App
