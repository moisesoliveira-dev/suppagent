type CreateTicketPrefill = {
  requester?: string
  email?: string
}

type Listener = () => void

const createListeners = new Set<Listener>()
const refreshListeners = new Set<Listener>()
let pendingPrefill: CreateTicketPrefill | null = null

export function openCreateTicketDialog(prefill?: CreateTicketPrefill) {
  pendingPrefill = prefill ?? null
  for (const listener of createListeners) listener()
}

export function consumeCreateTicketPrefill(): CreateTicketPrefill | null {
  const value = pendingPrefill
  pendingPrefill = null
  return value
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
