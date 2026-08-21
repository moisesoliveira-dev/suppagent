import { randomUUID } from 'node:crypto';
import type { ClientPlan } from './client-plan';

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeTags(tags: string[] | undefined): string[] {
  if (!tags) return [];
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

function normalizePhone(value: string | null | undefined): string | null {
  if (value == null) return null;
  const phone = value.trim();
  return phone || null;
}

function normalizeCompany(value: string | null | undefined): string | null {
  if (value == null) return null;
  const company = value.trim();
  return company || null;
}

export class Client {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _company: string | null,
    private _plan: ClientPlan,
    private _email: string,
    private _phone: string | null,
    private _tags: string[],
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(input: {
    name: string;
    company?: string | null;
    plan: ClientPlan;
    email: string;
    phone?: string | null;
    tags?: string[];
    now?: Date;
  }): Client {
    const name = input.name.trim();
    const email = normalizeEmail(input.email);
    if (!name) throw new Error('nome do cliente é obrigatório');
    if (!email || !email.includes('@')) {
      throw new Error('e-mail do cliente é inválido');
    }
    const now = input.now ?? new Date();
    return new Client(
      randomUUID(),
      name,
      normalizeCompany(input.company),
      input.plan,
      email,
      normalizePhone(input.phone),
      normalizeTags(input.tags),
      now,
      now,
    );
  }

  static reconstitute(props: {
    id: string;
    name: string;
    company: string | null;
    plan: ClientPlan;
    email: string;
    phone: string | null;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
  }): Client {
    return new Client(
      props.id,
      props.name,
      props.company,
      props.plan,
      props.email,
      props.phone,
      props.tags,
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
  get company() {
    return this._company;
  }
  get plan() {
    return this._plan;
  }
  get email() {
    return this._email;
  }
  get phone() {
    return this._phone;
  }
  get tags() {
    return [...this._tags];
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }

  update(input: {
    name?: string;
    company?: string | null;
    plan?: ClientPlan;
    email?: string;
    phone?: string | null;
    tags?: string[];
  }) {
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new Error('nome do cliente é obrigatório');
      this._name = name;
    }
    if (input.company !== undefined) {
      this._company = normalizeCompany(input.company);
    }
    if (input.plan !== undefined) {
      this._plan = input.plan;
    }
    if (input.email !== undefined) {
      const email = normalizeEmail(input.email);
      if (!email || !email.includes('@')) {
        throw new Error('e-mail do cliente é inválido');
      }
      this._email = email;
    }
    if (input.phone !== undefined) {
      this._phone = normalizePhone(input.phone);
    }
    if (input.tags !== undefined) {
      this._tags = normalizeTags(input.tags);
    }
    this._updatedAt = new Date();
  }
}
