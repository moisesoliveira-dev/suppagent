import { randomUUID } from 'node:crypto';

const VARIABLE_RE = /\{\{(\w+)\}\}/g;

export function extractVariables(body: string): string[] {
  const found = new Set<string>();
  for (const match of body.matchAll(VARIABLE_RE)) {
    found.add(match[1]!);
  }
  return [...found];
}

export function normalizeShortcut(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) throw new Error('atalho é obrigatório');
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (!/^\/[a-z0-9_-]+$/.test(withSlash)) {
    throw new Error('atalho inválido — use /texto (letras, números, _ ou -)');
  }
  return withSlash;
}

export function normalizeCategory(raw: string): string {
  const category = raw.trim().toLowerCase();
  if (!category) throw new Error('categoria é obrigatória');
  return category;
}

export class CannedResponse {
  private constructor(
    private readonly _id: string,
    private _title: string,
    private _category: string,
    private _shortcut: string,
    private _body: string,
    private _useCount: number,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(input: {
    title: string;
    category: string;
    shortcut: string;
    body: string;
    now?: Date;
  }): CannedResponse {
    const title = input.title.trim();
    const body = input.body.trim();
    if (!title) throw new Error('título é obrigatório');
    if (!body) throw new Error('corpo da resposta é obrigatório');
    const now = input.now ?? new Date();
    return new CannedResponse(
      randomUUID(),
      title,
      normalizeCategory(input.category),
      normalizeShortcut(input.shortcut),
      body,
      0,
      now,
      now,
    );
  }

  static reconstitute(props: {
    id: string;
    title: string;
    category: string;
    shortcut: string;
    body: string;
    useCount: number;
    createdAt: Date;
    updatedAt: Date;
  }): CannedResponse {
    return new CannedResponse(
      props.id,
      props.title,
      props.category,
      props.shortcut,
      props.body,
      props.useCount,
      props.createdAt,
      props.updatedAt,
    );
  }

  get id() {
    return this._id;
  }
  get title() {
    return this._title;
  }
  get category() {
    return this._category;
  }
  get shortcut() {
    return this._shortcut;
  }
  get body() {
    return this._body;
  }
  get useCount() {
    return this._useCount;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }
  get variables() {
    return extractVariables(this._body);
  }

  update(input: {
    title?: string;
    category?: string;
    shortcut?: string;
    body?: string;
  }) {
    if (input.title !== undefined) {
      const title = input.title.trim();
      if (!title) throw new Error('título é obrigatório');
      this._title = title;
    }
    if (input.category !== undefined) {
      this._category = normalizeCategory(input.category);
    }
    if (input.shortcut !== undefined) {
      this._shortcut = normalizeShortcut(input.shortcut);
    }
    if (input.body !== undefined) {
      const body = input.body.trim();
      if (!body) throw new Error('corpo da resposta é obrigatório');
      this._body = body;
    }
    this._updatedAt = new Date();
  }

  markUsed() {
    this._useCount += 1;
    this._updatedAt = new Date();
  }

  duplicate(now = new Date()): CannedResponse {
    return new CannedResponse(
      randomUUID(),
      `${this._title} (cópia)`,
      this._category,
      `${this._shortcut}-copia`,
      this._body,
      0,
      now,
      now,
    );
  }
}
