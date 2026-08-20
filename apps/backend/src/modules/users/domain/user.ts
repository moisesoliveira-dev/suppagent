import type { UserRole } from './user-role';

export type RegisterUserInput = {
  name: string;
  email: string;
  role: UserRole;
};

export class User {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _email: string,
    private _role: UserRole,
    private readonly _createdAt: Date,
  ) {}

  static register(input: RegisterUserInput): User {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (!name) throw new Error('nome do usuário é obrigatório');
    if (!email || !email.includes('@')) {
      throw new Error('e-mail do usuário é inválido');
    }
    return new User('', name, email, input.role, new Date());
  }

  static reconstitute(props: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
  }): User {
    return new User(
      props.id,
      props.name,
      props.email,
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
      role: this._role,
      createdAt: this._createdAt,
    });
  }

  changeRole(role: UserRole): void {
    this._role = role;
  }

  rename(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('nome do usuário é obrigatório');
    this._name = trimmed;
  }
}
