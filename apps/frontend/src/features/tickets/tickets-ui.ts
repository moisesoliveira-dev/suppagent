type Listener = () => void

const createListeners = new Set<Listener>()
const refreshListeners = new Set<Listener>()

export function openCreateTicketDialog() {
  for (const listener of createListeners) listener()
}

export function onOpenCreateTicket(listener: Listener): () => void {
  createListeners.add(listener)
  return () => {
    createListeners.delete(listener)
  }
}

export function notifyTicketsChanged() {
  for (const listener of refreshListeners) listener()
}

export function onTicketsChanged(listener: Listener): () => void {
  refreshListeners.add(listener)
  return () => {
    refreshListeners.delete(listener)
  }
}
