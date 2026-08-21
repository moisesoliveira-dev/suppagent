type Listener = () => void

const listeners = new Set<Listener>()

export function notifyClientsChanged() {
  for (const listener of listeners) listener()
}

export function onClientsChanged(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
