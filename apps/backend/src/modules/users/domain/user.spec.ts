import { User } from './user';
import { InvalidUserRoleError, parseUserRole } from './user-role';

describe('User', () => {
  it('cadastra usuário normal', () => {
    const user = User.register({
      name: ' Marina Costa ',
      email: 'Marina@Acme.com',
      role: 'user',
    });
    expect(user.isNew).toBe(true);
    expect(user.name).toBe('Marina Costa');
    expect(user.email).toBe('marina@acme.com');
    expect(user.role).toBe('user');
  });

  it('recusa e-mail inválido', () => {
    expect(() =>
      User.register({
        name: 'x',
        email: 'sem-arroba',
        role: 'technician',
      }),
    ).toThrow('e-mail');
  });
});

describe('parseUserRole', () => {
  it('aceita rótulos em português e inglês', () => {
    expect(parseUserRole('usuario')).toBe('user');
    expect(parseUserRole('técnico')).toBe('technician');
    expect(parseUserRole('technician')).toBe('technician');
  });

  it('rejeita perfil desconhecido', () => {
    expect(() => parseUserRole('admin')).toThrow(InvalidUserRoleError);
  });
});
