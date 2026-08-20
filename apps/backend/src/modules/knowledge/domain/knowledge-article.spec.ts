import { KnowledgeArticle } from './knowledge-article';

describe('KnowledgeArticle', () => {
  it('cria rascunho com tags normalizadas', () => {
    const article = KnowledgeArticle.create({
      title: '  reset de senha  ',
      category: ' Acesso ',
      body: 'passo a passo',
      tags: [' Login ', 'login', 'e-mail'],
      authorName: 'camila reis',
    });

    expect(article.title).toBe('reset de senha');
    expect(article.category).toBe('acesso');
    expect(article.published).toBe(false);
    expect(article.tags).toEqual(['login', 'e-mail']);
  });

  it('atualiza publicação e corpo', () => {
    const article = KnowledgeArticle.create({
      title: 'csv',
      category: 'relatórios',
      body: 'rascunho',
      authorName: 'c.reis',
    }).withId('a1');

    article.update({ body: 'conteúdo final', published: true });
    expect(article.body).toBe('conteúdo final');
    expect(article.published).toBe(true);
  });
});
