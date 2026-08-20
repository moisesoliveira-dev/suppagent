export type ViewId =
  | 'painel'
  | 'chamados'
  | 'clientes'
  | 'chatusuarios'
  | 'baseconhecimento'
  | 'respostasprontas'
  | 'sla'
  | 'automacoes'
  | 'equipe'
  | 'relatorios'
  | 'cadastros'
  | 'iachat'
  | 'iaagente'
  | 'iaroteamento'
  | 'iarespostas'
  | 'iaconfig'
  | 'configuracoes'

export type NavGroup = {
  label: string
  items: { id: ViewId; label: string; count?: number }[]
}

export const NAV_GROUPS: NavGroup[] = [
  { label: 'visão geral', items: [{ id: 'painel', label: 'painel' }] },
  {
    label: 'chamados',
    items: [{ id: 'chamados', label: 'chamados' }],
  },
  {
    label: 'atendimento',
    items: [
      { id: 'clientes', label: 'clientes' },
      { id: 'chatusuarios', label: 'chat com usuários' },
      { id: 'baseconhecimento', label: 'base de conhecimento' },
      { id: 'respostasprontas', label: 'respostas prontas' },
    ],
  },
  {
    label: 'gestão',
    items: [
      { id: 'sla', label: 'sla' },
      { id: 'automacoes', label: 'automações' },
      { id: 'equipe', label: 'equipe' },
      { id: 'relatorios', label: 'relatórios' },
    ],
  },
  { label: 'cadastros', items: [{ id: 'cadastros', label: 'cadastros' }] },
  {
    label: 'agente ia',
    items: [
      { id: 'iachat', label: 'chat com a ia' },
      { id: 'iaagente', label: 'visão geral' },
      { id: 'iaroteamento', label: 'roteamento' },
      { id: 'iarespostas', label: 'respostas automáticas' },
      { id: 'iaconfig', label: 'configuração da ia' },
    ],
  },
  { label: 'sistema', items: [{ id: 'configuracoes', label: 'configurações' }] },
]
