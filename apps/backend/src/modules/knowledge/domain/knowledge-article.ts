export type CreateArticleInput = {
  title: string;
  category: string;
  body: string;
  tags?: string[];
  published?: boolean;
  authorName: string;
  sourceTicketId?: number | null;
  views?: number;
  usefulPercent?: number;
  ticketsAvoided?: number;
  now?: Date;
};

export class KnowledgeArticle {
  private constructor(
    private readonly _id: string,
    private _title: string,
    private _category: string,
    private _body: string,
    private _tags: string[],
    private _published: boolean,
    private _authorName: string,
    private _views: number,
    private _usefulPercent: number,
    private _ticketsAvoided: number,
    private readonly _sourceTicketId: number | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(input: CreateArticleInput): KnowledgeArticle {
    const now = input.now ?? new Date();
    const title = input.title.trim();
    const category = input.category.trim().toLowerCase();
    const body = input.body.trim();
    const authorName = input.authorName.trim();
    if (!title) throw new Error('título do artigo é obrigatório');
    if (!category) throw new Error('categoria do artigo é obrigatória');
    if (!body) throw new Error('corpo do artigo é obrigatório');
    if (!authorName) throw new Error('autor do artigo é obrigatório');

    const tags = normalizeTags(input.tags ?? []);

    return new KnowledgeArticle(
      '',
      title,
      category,
      body,
      tags,
      Boolean(input.published),
      authorName,
      input.views ?? 0,
      input.usefulPercent ?? 0,
      input.ticketsAvoided ?? 0,
      input.sourceTicketId ?? null,
      now,
      now,
    );
  }

  static reconstitute(props: {
    id: string;
    title: string;
    category: string;
    body: string;
    tags: string[];
    published: boolean;
    authorName: string;
    views: number;
    usefulPercent: number;
    ticketsAvoided: number;
    sourceTicketId: number | null;
    createdAt: Date;
    updatedAt: Date;
  }): KnowledgeArticle {
    return new KnowledgeArticle(
      props.id,
      props.title,
      props.category,
      props.body,
      [...props.tags],
      props.published,
      props.authorName,
      props.views,
      props.usefulPercent,
      props.ticketsAvoided,
      props.sourceTicketId,
      props.createdAt,
      props.updatedAt,
    );
  }

  get id(): string {
    return this._id;
  }

  get isNew(): boolean {
    return this._id === '';
  }

  get title(): string {
    return this._title;
  }

  get category(): string {
    return this._category;
  }

  get body(): string {
    return this._body;
  }

  get tags(): readonly string[] {
    return this._tags;
  }

  get published(): boolean {
    return this._published;
  }

  get authorName(): string {
    return this._authorName;
  }

  get views(): number {
    return this._views;
  }

  get usefulPercent(): number {
    return this._usefulPercent;
  }

  get ticketsAvoided(): number {
    return this._ticketsAvoided;
  }

  get sourceTicketId(): number | null {
    return this._sourceTicketId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  update(input: {
    title?: string;
    category?: string;
    body?: string;
    tags?: string[];
    published?: boolean;
    at?: Date;
  }): void {
    const at = input.at ?? new Date();
    if (input.title !== undefined) {
      const title = input.title.trim();
      if (!title) throw new Error('título do artigo é obrigatório');
      this._title = title;
    }
    if (input.category !== undefined) {
      const category = input.category.trim().toLowerCase();
      if (!category) throw new Error('categoria do artigo é obrigatória');
      this._category = category;
    }
    if (input.body !== undefined) {
      const body = input.body.trim();
      if (!body) throw new Error('corpo do artigo é obrigatório');
      this._body = body;
    }
    if (input.tags !== undefined) {
      this._tags = normalizeTags(input.tags);
    }
    if (input.published !== undefined) {
      this._published = input.published;
    }
    this._updatedAt = at;
  }

  registerView(at = new Date()): void {
    this._views += 1;
    this._updatedAt = at;
  }

  withId(id: string): KnowledgeArticle {
    return KnowledgeArticle.reconstitute({
      id,
      title: this._title,
      category: this._category,
      body: this._body,
      tags: this._tags,
      published: this._published,
      authorName: this._authorName,
      views: this._views,
      usefulPercent: this._usefulPercent,
      ticketsAvoided: this._ticketsAvoided,
      sourceTicketId: this._sourceTicketId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    });
  }
}

function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tags) {
    const tag = raw.trim().toLowerCase();
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    result.push(tag);
  }
  return result;
}
