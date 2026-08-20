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
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
