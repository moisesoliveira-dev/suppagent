import { randomUUID } from 'node:crypto';

function normalizeKeywords(raw: string[]): string[] {
  const cleaned = [
    ...new Set(
      raw
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
  if (cleaned.length === 0) {
    throw new Error('informe ao menos uma palavra-chave');
  }
  return cleaned;
}

export class RoutingRule {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _keywords: string[],
    private _category: string,
    private _agentHandle: string | null,
    private _enabled: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(input: {
    name: string;
    keywords: string[];
    category: string;
    agentHandle?: string | null;
    enabled?: boolean;
    now?: Date;
  }): RoutingRule {
    const name = input.name.trim();
    const category = input.category.trim().toLowerCase();
    if (!name) throw new Error('nome da regra é obrigatório');
    if (!category) throw new Error('categoria é obrigatória');
    const keywords = normalizeKeywords(input.keywords);
    const agent = input.agentHandle?.trim() || null;
    const now = input.now ?? new Date();
    return new RoutingRule(
      randomUUID(),
      name,
      keywords,
      category,
      agent,
      input.enabled ?? true,
      now,
      now,
    );
  }

  static reconstitute(props: {
    id: string;
    name: string;
    keywords: string[];
    category: string;
    agentHandle: string | null;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): RoutingRule {
    return new RoutingRule(
      props.id,
      props.name,
      props.keywords,
      props.category,
      props.agentHandle,
      props.enabled,
      props.createdAt,
      props.updatedAt,
    );
  }

  get id() {
    return this._id;
  }
  get name() {
    return this._name;
  }
  get keywords() {
    return [...this._keywords];
  }
  get category() {
    return this._category;
  }
  get agentHandle() {
    return this._agentHandle;
  }
  get enabled() {
    return this._enabled;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }

  update(input: {
    name?: string;
    keywords?: string[];
    category?: string;
    agentHandle?: string | null;
    enabled?: boolean;
  }) {
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new Error('nome da regra é obrigatório');
      this._name = name;
    }
    if (input.keywords !== undefined) {
      this._keywords = normalizeKeywords(input.keywords);
    }
    if (input.category !== undefined) {
      const category = input.category.trim().toLowerCase();
      if (!category) throw new Error('categoria é obrigatória');
      this._category = category;
    }
    if (input.agentHandle !== undefined) {
      this._agentHandle = input.agentHandle?.trim() || null;
    }
    if (input.enabled !== undefined) this._enabled = input.enabled;
    this._updatedAt = new Date();
  }
}
