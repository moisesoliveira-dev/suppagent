import type { UserRole } from './user-role';

export type RegisterUserInput = {
  name: string;
  email: string;
  role: UserRole;
  handle?: string | null;
};

function normalizeHandle(value: string | null | undefined): string | null {
  if (value == null) return null;
  const handle = value.trim().toLowerCase();
  return handle || null;
}

export class User {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _email: string,
    private _handle: string | null,
    private _role: UserRole,
    private readonly _createdAt: Date,
  ) {}

  static register(input: RegisterUserInput): User {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const handle = normalizeHandle(input.handle);
    if (!name) throw new Error('nome do usuário é obrigatório');
    if (!email || !email.includes('@')) {
      throw new Error('e-mail do usuário é inválido');
    }
    if (input.role === 'technician' && !handle) {
      throw new Error('identificador do técnico é obrigatório');
    }
    if (input.role === 'user' && handle) {
      throw new Error('usuário normal não possui identificador de agente');
    }
    if (handle && !/^[a-z0-9._-]+$/.test(handle)) {
      throw new Error('identificador inválido (use letras, números, . _ -)');
    }
    return new User('', name, email, handle, input.role, new Date());
  }

  static reconstitute(props: {
    id: string;
    name: string;
    email: string;
    handle: string | null;
    role: UserRole;
    createdAt: Date;
  }): User {
    return new User(
      props.id,
      props.name,
      props.email,
      props.handle,
      props.role,
      props.createdAt,
    );
  }

  get id(): string {
    return this._id;
  }

  get isNew(): boolean {
    return this._id === '';
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get handle(): string | null {
    return this._handle;
  }

  get role(): UserRole {
    return this._role;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  withId(id: string): User {
    return User.reconstitute({
      id,
      name: this._name,
      email: this._email,
      handle: this._handle,
      role: this._role,
      createdAt: this._createdAt,
    });
  }
}
