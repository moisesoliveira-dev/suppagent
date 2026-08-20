export type KnowledgeArticle = {
  id: string
  title: string
  category: string
  body: string
  tags: string[]
  published: boolean
  author: string
  views: number
  viewsLabel: string
  useful: string
  saved: string
  age: string
  meta: string
  sourceTicketId: string | null
  updatedAt: string
}

export type KnowledgeListResponse = {
  items: KnowledgeArticle[]
}

export type CreateKnowledgeInput = {
  title: string
  category: string
  body: string
  tags?: string[]
  published?: boolean
  author: string
}

export type CreateKnowledgeFromTicketInput = {
  ticketId: string
  title?: string
  category?: string
  body?: string
  tags?: string[]
  published?: boolean
  author: string
}

export const KNOWLEDGE_CATEGORIES = [
  'acesso',
  'financeiro',
  'relatórios',
  'bug',
  'cadastro',
  'suporte técnico',
]

export const CURRENT_KB_AUTHOR = 'camila reis'
