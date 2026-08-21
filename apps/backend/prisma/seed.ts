import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../dist/generated/client';

const SEED = [
  {
    id: 4471,
    subject: 'erro ao gerar relatório mensal',
    status: 'OPEN' as const,
    priority: 'URGENT' as const,
    agentId: null as string | null,
    category: 'financeiro',
    requesterName: 'marina costa',
    requesterEmail: 'marina.costa@vertexcorp.com',
    createdAt: new Date('2026-08-19T12:04:00'),
    events: [
      {
        id: 'seed-4471-1',
        occurredAt: new Date('2026-08-19T12:04:00'),
        text: 'marina.costa — relatório de agosto travando em "gerando…".',
        isInternalNote: false,
      },
      {
        id: 'seed-4471-2',
        occurredAt: new Date('2026-08-19T12:08:00'),
        text: 'camila.reis (nota interna) — já visto antes em relatórios grandes.',
        isInternalNote: true,
      },
      {
        id: 'seed-4471-3',
        occurredAt: new Date('2026-08-19T12:12:00'),
        text: 'Oi Marina! Estou verificando agora, pode aguardar mais um instante?',
        isInternalNote: false,
        author: 'AGENT' as const,
      },
      {
        id: 'seed-4471-4',
        occurredAt: new Date('2026-08-19T12:14:00'),
        text: 'claro, obrigada!',
        isInternalNote: false,
        author: 'REQUESTER' as const,
      },
    ],
  },
  {
    id: 4470,
    subject: 'não consigo acessar o painel',
    status: 'IN_PROGRESS' as const,
    priority: 'HIGH' as const,
    agentId: 'b.alves',
    category: 'acesso',
    requesterName: 'rafael nunes',
    requesterEmail: 'rafael.nunes@email.com',
    createdAt: new Date('2026-08-19T11:40:00'),
    events: [
      {
        id: 'seed-4470-1',
        occurredAt: new Date('2026-08-19T11:40:00'),
        text: 'rafael.nunes — login recusado no painel.',
        isInternalNote: false,
      },
      {
        id: 'seed-4470-2',
        occurredAt: new Date('2026-08-19T11:48:00'),
        text: 'Rafael, tente limpar o cache do navegador e entrar novamente.',
        isInternalNote: false,
        author: 'AGENT' as const,
      },
      {
        id: 'seed-4470-3',
        occurredAt: new Date('2026-08-19T11:55:00'),
        text: 'obrigado, já consegui acessar!',
        isInternalNote: false,
        author: 'REQUESTER' as const,
      },
    ],
  },
  {
    id: 4468,
    subject: 'exportar dados em csv',
    status: 'OPEN' as const,
    priority: 'LOW' as const,
    agentId: null,
    category: 'relatórios',
    requesterName: 'helena duarte',
    requesterEmail: 'helena.duarte@email.com',
    createdAt: new Date('2026-08-19T11:10:00'),
    events: [
      {
        id: 'seed-4468-1',
        occurredAt: new Date('2026-08-19T11:10:00'),
        text: 'helena.duarte — precisa exportar chamados em csv.',
        isInternalNote: false,
      },
    ],
  },
  {
    id: 4465,
    subject: 'cobrança duplicada — agosto',
    status: 'WAITING' as const,
    priority: 'HIGH' as const,
    agentId: 'c.reis',
    category: 'financeiro',
    requesterName: 'joão pedro lima',
    requesterEmail: 'joao.lima@email.com',
    createdAt: new Date('2026-08-19T10:10:00'),
    events: [
      {
        id: 'seed-4465-1',
        occurredAt: new Date('2026-08-19T10:10:00'),
        text: 'joão — cobrança em duplicidade na fatura de agosto.',
        isInternalNote: false,
      },
    ],
  },
  {
    id: 4460,
    subject: 'botão de salvar — safari',
    status: 'IN_PROGRESS' as const,
    priority: 'MEDIUM' as const,
    agentId: 'c.reis',
    category: 'bug',
    requesterName: 'studio verde',
    requesterEmail: 'contato@studioverde.com',
    createdAt: new Date('2026-08-19T09:20:00'),
    events: [
      {
        id: 'seed-4460-1',
        occurredAt: new Date('2026-08-19T09:20:00'),
        text: 'safari antigo não dispara o save.',
        isInternalNote: false,
      },
    ],
  },
  {
    id: 4452,
    subject: 'alterar e-mail de cobrança',
    status: 'RESOLVED' as const,
    priority: 'LOW' as const,
    agentId: 'b.alves',
    category: 'financeiro',
    requesterName: 'diego martins',
    requesterEmail: 'diego@email.com',
    createdAt: new Date('2026-08-18T10:00:00'),
    events: [
      {
        id: 'seed-4452-1',
        occurredAt: new Date('2026-08-18T10:00:00'),
        text: 'e-mail de cobrança atualizado.',
        isInternalNote: false,
      },
    ],
  },
  {
    id: 4448,
    subject: 'sistema fora do ar — login não abre',
    status: 'OPEN' as const,
    priority: 'URGENT' as const,
    agentId: 'c.reis',
    category: 'acesso',
    requesterName: 'vários',
    requesterEmail: 'ops@balcao.com',
    createdAt: new Date('2026-08-19T12:40:00'),
    events: [
      {
        id: 'seed-4448-1',
        occurredAt: new Date('2026-08-19T12:40:00'),
        text: 'login indisponível.',
        isInternalNote: false,
      },
    ],
  },
  {
    id: 4441,
    subject: 'pagamento não é confirmado no checkout',
    status: 'IN_PROGRESS' as const,
    priority: 'URGENT' as const,
    agentId: null,
    category: 'financeiro',
    requesterName: 'cliente checkout',
    requesterEmail: 'pagamentos@email.com',
    createdAt: new Date('2026-08-19T11:20:00'),
    events: [
      {
        id: 'seed-4441-1',
        occurredAt: new Date('2026-08-19T11:20:00'),
        text: 'pagamento pendente no checkout.',
        isInternalNote: false,
      },
    ],
  },
  {
    id: 4438,
    subject: 'duplicidade de registro de cliente',
    status: 'OPEN' as const,
    priority: 'HIGH' as const,
    agentId: 'r.souza',
    category: 'cadastro',
    requesterName: 'interno',
    requesterEmail: 'rafael.souza@balcao.com',
    createdAt: new Date('2026-08-19T11:35:00'),
    events: [
      {
        id: 'seed-4438-1',
        occurredAt: new Date('2026-08-19T11:35:00'),
        text: 'dois registros para o mesmo cliente.',
        isInternalNote: false,
      },
    ],
  },
  {
    id: 4430,
    subject: 'senha resetada com sucesso',
    status: 'RESOLVED' as const,
    priority: 'MEDIUM' as const,
    agentId: 'c.reis',
    category: 'acesso',
    requesterName: 'marina costa',
    requesterEmail: 'marina.costa@vertexcorp.com',
    createdAt: new Date('2026-08-17T09:00:00'),
    events: [
      {
        id: 'seed-4430-1',
        occurredAt: new Date('2026-08-17T09:00:00'),
        text: 'senha redefinida.',
        isInternalNote: false,
      },
    ],
  },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });

  try {
    const technicians = [
      {
        email: 'camila.reis@balcao.com',
        name: 'camila reis',
        handle: 'c.reis',
        role: 'TECHNICIAN' as const,
      },
      {
        email: 'bruno.alves@balcao.com',
        name: 'bruno alves',
        handle: 'b.alves',
        role: 'TECHNICIAN' as const,
      },
      {
        email: 'rafael.souza@balcao.com',
        name: 'rafael souza',
        handle: 'r.souza',
        role: 'TECHNICIAN' as const,
      },
    ];

    for (const tech of technicians) {
      await prisma.user.upsert({
        where: { email: tech.email },
        update: {
          name: tech.name,
          handle: tech.handle,
          role: tech.role,
        },
        create: tech,
      });
    }

    for (const ticket of SEED) {
      const { events, ...data } = ticket;
      await prisma.ticket.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
          updatedAt: data.createdAt,
          events: {
            create: events.map((event) => ({
              id: event.id,
              occurredAt: event.occurredAt,
              text: event.text,
              isInternalNote: event.isInternalNote,
              author:
                'author' in event && event.author
                  ? event.author
                  : event.isInternalNote
                    ? ('AGENT' as const)
                    : ('REQUESTER' as const),
              updatedAt: event.occurredAt,
            })),
          },
        },
      });
    }

    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('tickets', 'id'), COALESCE((SELECT MAX(id) FROM tickets), 1))`,
    );

    const articles = [
      {
        id: 'seed-kb-senha',
        title: 'Como resetar a senha da sua conta',
        category: 'acesso',
        body: 'Peça ao cliente para acessar "esqueci minha senha" na tela de login. O link de redefinição expira em 30 minutos.',
        tags: ['login', 'e-mail', 'segurança'],
        published: true,
        authorName: 'bruno alves',
        views: 1204,
        usefulPercent: 91,
        ticketsAvoided: 64,
        sourceTicketId: 4430,
        createdAt: new Date('2026-08-17T10:00:00'),
      },
      {
        id: 'seed-kb-cobranca',
        title: 'Entendendo a cobrança recorrente',
        category: 'financeiro',
        body: 'A cobrança ocorre sempre no dia 5 de cada mês. Cobranças duplicadas geralmente vêm de troca de cartão no meio do ciclo.',
        tags: ['fatura', 'cartão', 'reembolso'],
        published: true,
        authorName: 'camila reis',
        views: 856,
        usefulPercent: 78,
        ticketsAvoided: 31,
        sourceTicketId: null as number | null,
        createdAt: new Date('2026-08-12T10:00:00'),
      },
      {
        id: 'seed-kb-relatorio',
        title: 'Erros comuns ao gerar relatório mensal',
        category: 'relatórios',
        body: 'Relatórios com mais de 10 mil linhas podem ficar presos em "gerando…" por até 5 minutos.',
        tags: ['relatório mensal', 'exportação', 'fila'],
        published: true,
        authorName: 'camila reis',
        views: 340,
        usefulPercent: 86,
        ticketsAvoided: 27,
        sourceTicketId: null,
        createdAt: new Date('2026-08-18T10:00:00'),
      },
      {
        id: 'seed-kb-csv',
        title: 'Exportando relatórios em CSV',
        category: 'relatórios',
        body: 'Rascunho: descrever o passo a passo para exportação em CSV.',
        tags: ['csv', 'exportação'],
        published: false,
        authorName: 'helena duarte',
        views: 0,
        usefulPercent: 0,
        ticketsAvoided: 0,
        sourceTicketId: null,
        createdAt: new Date('2026-08-19T10:00:00'),
      },
      {
        id: 'seed-kb-permissoes',
        title: 'Configurando permissões de equipe',
        category: 'acesso',
        body: 'Apenas administradores podem alterar permissões de outros agentes.',
        tags: ['permissões', 'equipe', 'admin'],
        published: true,
        authorName: 'bruno alves',
        views: 512,
        usefulPercent: 88,
        ticketsAvoided: 19,
        sourceTicketId: null,
        createdAt: new Date('2026-08-05T10:00:00'),
      },
      {
        id: 'seed-kb-safari',
        title: 'Integração com Safari — problemas conhecidos',
        category: 'bug',
        body: 'O botão de salvar não responde em versões antigas do Safari (< 16).',
        tags: ['safari', 'bug', 'salvar'],
        published: false,
        authorName: 'camila reis',
        views: 12,
        usefulPercent: 0,
        ticketsAvoided: 2,
        sourceTicketId: null,
        createdAt: new Date('2026-08-19T07:00:00'),
      },
    ];

    for (const article of articles) {
      await prisma.knowledgeArticle.upsert({
        where: { id: article.id },
        update: {},
        create: {
          ...article,
          updatedAt: article.createdAt,
        },
      });
    }

    const teamChats = [
      {
        id: 'seed-team-geral',
        name: 'geral',
        kind: 'CHANNEL' as const,
        createdAt: new Date('2026-08-01T09:00:00'),
        messages: [
          {
            id: 'seed-team-geral-1',
            occurredAt: new Date('2026-08-19T09:00:00'),
            text: 'bom dia equipe — usem este canal para alinhamentos rápidos.',
            authorHandle: 'c.reis',
            authorName: 'camila reis',
          },
          {
            id: 'seed-team-geral-2',
            occurredAt: new Date('2026-08-19T09:15:00'),
            text: 'hoje priorizamos os urgentes de login.',
            authorHandle: 'b.alves',
            authorName: 'bruno alves',
          },
        ],
      },
      {
        id: 'seed-team-plantao',
        name: 'plantão',
        kind: 'CHANNEL' as const,
        createdAt: new Date('2026-08-01T09:00:00'),
        messages: [
          {
            id: 'seed-team-plantao-1',
            occurredAt: new Date('2026-08-19T12:00:00'),
            text: 'plantão da tarde coberto.',
            authorHandle: 'r.souza',
            authorName: 'rafael souza',
          },
        ],
      },
    ];

    for (const chat of teamChats) {
      const { messages, ...data } = chat;
      await prisma.teamChat.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
          updatedAt: data.createdAt,
          messages: {
            create: messages.map((message) => ({
              ...message,
              updatedAt: message.occurredAt,
            })),
          },
        },
      });
    }

    const seedNotifications = [
      {
        id: 'seed-notif-assigned',
        recipientHandle: 'c.reis',
        type: 'ticket_assigned',
        title: 'chamado atribuído a você',
        body: '#4465 — cobrança duplicada — agosto',
        ticketId: 4465,
        createdAt: new Date('2026-08-20T10:00:00'),
      },
      {
        id: 'seed-notif-urgent',
        recipientHandle: 'c.reis',
        type: 'ticket_urgent',
        title: 'chamado urgente aberto',
        body: '#4448 — sistema fora do ar — login não abre',
        ticketId: 4448,
        createdAt: new Date('2026-08-20T11:00:00'),
      },
      {
        id: 'seed-notif-opened',
        recipientHandle: 'b.alves',
        type: 'ticket_opened',
        title: 'novo chamado na fila',
        body: '#4471 — erro ao gerar relatório mensal',
        ticketId: 4471,
        createdAt: new Date('2026-08-20T09:30:00'),
      },
    ];

    for (const item of seedNotifications) {
      await prisma.notification.upsert({
        where: { id: item.id },
        update: {},
        create: {
          ...item,
          updatedAt: item.createdAt,
        },
      });
    }

    await prisma.notificationPreference.upsert({
      where: { recipientHandle: 'c.reis' },
      update: {},
      create: {
        recipientHandle: 'c.reis',
        assigned: true,
        sla: true,
        digest: false,
        sound: true,
      },
    });

    const automationRules = [
      {
        id: 'seed-auto-fin',
        name: 'Atribuir chamados financeiros',
        trigger: 'novo chamado é criado',
        condition: 'categoria = financeiro',
        action: 'atribuir para camila reis / prioridade = média',
        enabled: true,
        authorName: 'camila reis',
        runCount: 214,
        lastRunAt: new Date('2026-08-20T12:00:00'),
        createdAt: new Date('2026-07-01T10:00:00'),
      },
      {
        id: 'seed-auto-escalar',
        name: 'Escalar urgentes sem resposta',
        trigger: 'chamado sem resposta há 30 minutos',
        condition: 'prioridade = urgente',
        action: 'notificar coordenador / marcar tag "escalado"',
        enabled: true,
        authorName: 'bruno alves',
        runCount: 42,
        lastRunAt: new Date('2026-08-20T09:00:00'),
        createdAt: new Date('2026-07-10T10:00:00'),
      },
      {
        id: 'seed-auto-fechar',
        name: 'Fechar chamados resolvidos',
        trigger: 'status = resolvido há 3 dias',
        condition: 'sem nova resposta do cliente',
        action: 'fechar chamado / enviar aviso de encerramento',
        enabled: true,
        authorName: 'camila reis',
        runCount: 189,
        lastRunAt: new Date('2026-08-20T06:00:00'),
        createdAt: new Date('2026-06-15T10:00:00'),
      },
      {
        id: 'seed-auto-safari',
        name: 'Alertar bugs no Safari',
        trigger: 'novo chamado é criado',
        condition: 'categoria = bug e menciona "safari"',
        action: 'marcar tag "safari" / notificar equipe de dev',
        enabled: false,
        authorName: 'camila reis',
        runCount: 8,
        lastRunAt: new Date('2026-08-20T07:00:00'),
        createdAt: new Date('2026-08-17T10:00:00'),
      },
      {
        id: 'seed-auto-csat',
        name: 'Enviar pesquisa de satisfação',
        trigger: 'chamado é encerrado',
        condition: 'cliente respondeu ao menos 1 vez',
        action: 'enviar pesquisa de satisfação por e-mail',
        enabled: true,
        authorName: 'bruno alves',
        runCount: 301,
        lastRunAt: new Date('2026-08-20T11:20:00'),
        createdAt: new Date('2026-08-01T10:00:00'),
      },
    ];

    for (const rule of automationRules) {
      await prisma.automationRule.upsert({
        where: { id: rule.id },
        update: {},
        create: {
          ...rule,
          updatedAt: rule.createdAt,
        },
      });
    }

    const slaPolicies = [
      {
        id: 'seed-sla-urgent',
        priority: 'URGENT' as const,
        responseMinutes: 15,
        resolutionMinutes: 240,
      },
      {
        id: 'seed-sla-high',
        priority: 'HIGH' as const,
        responseMinutes: 30,
        resolutionMinutes: 480,
      },
      {
        id: 'seed-sla-medium',
        priority: 'MEDIUM' as const,
        responseMinutes: 120,
        resolutionMinutes: 1440,
      },
      {
        id: 'seed-sla-low',
        priority: 'LOW' as const,
        responseMinutes: 480,
        resolutionMinutes: 4320,
      },
    ];

    for (const policy of slaPolicies) {
      await prisma.slaPolicy.upsert({
        where: { priority: policy.priority },
        update: {
          responseMinutes: policy.responseMinutes,
          resolutionMinutes: policy.resolutionMinutes,
        },
        create: {
          ...policy,
          createdAt: new Date('2026-06-01T10:00:00'),
          updatedAt: new Date('2026-06-01T10:00:00'),
        },
      });
    }

    const cannedResponses = [
      {
        id: 'seed-canned-ola',
        title: 'saudação inicial',
        category: 'saudacao',
        shortcut: '/ola',
        body: 'Olá {{nome_cliente}}! Meu nome é {{agente}} e vou te ajudar com isso.',
        useCount: 342,
      },
      {
        id: 'seed-canned-detalhes',
        title: 'solicitar mais informações',
        category: 'acesso',
        shortcut: '/detalhes',
        body: 'Para te ajudar melhor, você pode enviar um print da tela?',
        useCount: 128,
      },
      {
        id: 'seed-canned-reembolso',
        title: 'reembolso solicitado',
        category: 'financeiro',
        shortcut: '/reembolso',
        body: 'Solicitei o reembolso. O valor deve cair em até {{prazo_reembolso}} dias úteis.',
        useCount: 89,
      },
      {
        id: 'seed-canned-senha',
        title: 'como resetar a senha',
        category: 'acesso',
        shortcut: '/senha',
        body: 'Você pode resetar sua senha em "esqueci minha senha". O link expira em {{tempo_expiracao}} minutos.',
        useCount: 214,
      },
      {
        id: 'seed-canned-encerrar',
        title: 'encerramento padrão',
        category: 'encerramento',
        shortcut: '/encerrar',
        body: 'Ficamos felizes em ajudar, {{nome_cliente}}!',
        useCount: 401,
      },
      {
        id: 'seed-canned-escalar',
        title: 'escalonamento para especialista',
        category: 'escalonamento',
        shortcut: '/escalar',
        body: 'Vou transferir seu chamado para um especialista em {{categoria}}.',
        useCount: 47,
      },
    ];

    for (const item of cannedResponses) {
      await prisma.cannedResponse.upsert({
        where: { id: item.id },
        update: {},
        create: {
          ...item,
          createdAt: new Date('2026-07-01T10:00:00'),
          updatedAt: new Date('2026-07-01T10:00:00'),
        },
      });
    }

    const routingRules = [
      {
        id: 'seed-route-fin',
        name: 'financeiro / reembolso',
        keywords: ['reembolso', 'cobrança', 'pagamento', 'fatura'],
        category: 'financeiro',
        agentHandle: 'c.reis',
        enabled: true,
      },
      {
        id: 'seed-route-acesso',
        name: 'acesso / login',
        keywords: ['login', 'senha', 'acesso', 'erro'],
        category: 'acesso',
        agentHandle: 'b.alves',
        enabled: true,
      },
      {
        id: 'seed-route-cancel',
        name: 'cancelamento (revisão)',
        keywords: ['cancelar', 'cancelamento', 'plano'],
        category: 'indefinido',
        agentHandle: null as string | null,
        enabled: true,
      },
    ];

    for (const rule of routingRules) {
      await prisma.routingRule.upsert({
        where: { id: rule.id },
        update: {},
        create: {
          ...rule,
          createdAt: new Date('2026-07-01T10:00:00'),
          updatedAt: new Date('2026-07-01T10:00:00'),
        },
      });
    }

    await prisma.aiChatSession.upsert({
      where: { id: 'seed-ai-chat-1' },
      update: {},
      create: {
        id: 'seed-ai-chat-1',
        title: 'chamados urgentes abertos',
        ownerHandle: 'c.reis',
        createdAt: new Date('2026-08-20T10:00:00'),
        updatedAt: new Date('2026-08-20T10:05:00'),
        messages: {
          create: [
            {
              id: 'seed-ai-msg-1',
              role: 'ASSISTANT',
              content:
                'Olá! Posso responder perguntas sobre chamados, clientes, SLA e o funcionamento geral do sistema.',
              createdAt: new Date('2026-08-20T10:00:00'),
              updatedAt: new Date('2026-08-20T10:00:00'),
            },
            {
              id: 'seed-ai-msg-2',
              role: 'USER',
              content: 'quantos chamados urgentes estão em aberto agora?',
              createdAt: new Date('2026-08-20T10:01:00'),
              updatedAt: new Date('2026-08-20T10:01:00'),
            },
            {
              id: 'seed-ai-msg-3',
              role: 'ASSISTANT',
              content:
                'Há <b>6 chamados urgentes</b> em aberto agora. Três deles (#4471, #4448 e #4441) já estão vencidos ou muito próximos do prazo.',
              createdAt: new Date('2026-08-20T10:01:01'),
              updatedAt: new Date('2026-08-20T10:01:01'),
            },
          ],
        },
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
