type Listener = () => void

const listeners = new Set<Listener>()

export function notifyKnowledgeChanged() {
  for (const listener of listeners) listener()
}

export function onKnowledgeChanged(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
