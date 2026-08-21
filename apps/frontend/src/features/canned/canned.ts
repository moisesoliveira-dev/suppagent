export type CannedResponse = {
  id: string
  title: string
  category: string
  shortcut: string
  body: string
  useCount: number
  meta: string
  variables: string[]
  variableHints: string[]
  createdAt: string
  updatedAt: string
}

export type CannedListResponse = {
  categories: string[]
  items: CannedResponse[]
}

export function categoryLabel(category: string): string {
  if (category === 'todas') return 'todas'
  if (category === 'saudacao') return 'saudação'
  return category
}
