import { CreateKnowledgeFromTicketService } from './create-knowledge-from-ticket.service';
import { KnowledgeArticle } from '../domain/knowledge-article';
import type { KnowledgeArticleRepository } from '../domain/knowledge-article.repository';
import type { TicketSourcePort } from '../domain/ticket-source.port';
import {
  KnowledgeFromTicketAlreadyExistsError,
  TicketNotClosedForKnowledgeError,
} from '../domain/knowledge.errors';

describe('CreateKnowledgeFromTicketService', () => {
  const repo: KnowledgeArticleRepository = {
    findById: jest.fn(),
    findBySourceTicketId: jest.fn().mockResolvedValue(null),
    list: jest.fn(),
    save: jest.fn(async (article) => article.withId('kb-1')),
  };

  const tickets: TicketSourcePort = {
    findById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (repo.findBySourceTicketId as jest.Mock).mockResolvedValue(null);
    (repo.save as jest.Mock).mockImplementation(async (article) =>
      article.withId('kb-1'),
    );
  });

  it('cria artigo só quando o chamado está encerrado', async () => {
    (tickets.findById as jest.Mock).mockResolvedValue({
      id: 4430,
      subject: 'senha resetada com sucesso',
      category: 'acesso',
      status: 'resolved',
      agentId: 'c.reis',
      publicMessages: [
        { author: 'requester', text: 'perdi a senha' },
        { author: 'agent', text: 'reset enviado' },
      ],
    });

    const service = new CreateKnowledgeFromTicketService(repo, tickets);
    const article = await service.execute({
      ticketId: 4430,
      authorName: 'camila reis',
    });

    expect(article.id).toBe('kb-1');
    expect(article.sourceTicketId).toBe(4430);
    expect(article.category).toBe('acesso');
    expect(article.body).toContain('cliente: perdi a senha');
    expect(repo.save).toHaveBeenCalled();
  });

  it('recusa chamado ainda aberto', async () => {
    (tickets.findById as jest.Mock).mockResolvedValue({
      id: 4471,
      subject: 'erro',
      category: 'financeiro',
      status: 'open',
      agentId: null,
      publicMessages: [],
    });

    const service = new CreateKnowledgeFromTicketService(repo, tickets);
    await expect(
      service.execute({ ticketId: 4471, authorName: 'camila reis' }),
    ).rejects.toBeInstanceOf(TicketNotClosedForKnowledgeError);
  });

  it('recusa duplicata do mesmo chamado', async () => {
    (repo.findBySourceTicketId as jest.Mock).mockResolvedValue(
      KnowledgeArticle.create({
        title: 'já existe',
        category: 'acesso',
        body: 'x',
        authorName: 'c.reis',
        sourceTicketId: 4430,
      }).withId('kb-dup'),
    );

    const service = new CreateKnowledgeFromTicketService(repo, tickets);
    await expect(
      service.execute({ ticketId: 4430, authorName: 'camila reis' }),
    ).rejects.toBeInstanceOf(KnowledgeFromTicketAlreadyExistsError);
  });
});
