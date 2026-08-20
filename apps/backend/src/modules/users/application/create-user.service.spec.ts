import { Test } from '@nestjs/testing';
import { User } from '../domain/user';
import { UserEmailAlreadyExistsError } from '../domain/user.errors';
import { USER_REPOSITORY } from '../domain/user.repository';
import { CreateUserService } from './create-user.service';

describe('CreateUserService', () => {
  it('persiste novo técnico', async () => {
    const save = jest.fn(async (user: User) => user.withId('u-1'));
    const findByEmail = jest.fn().mockResolvedValue(null);
    const findByHandle = jest.fn().mockResolvedValue(null);
    const module = await Test.createTestingModule({
      providers: [
        CreateUserService,
        {
          provide: USER_REPOSITORY,
          useValue: { save, findByEmail, findByHandle },
        },
      ],
    }).compile();

    const created = await module.get(CreateUserService).execute({
      name: 'Bruno Alves',
      email: 'bruno@balcao.com',
      role: 'technician',
      handle: 'b.alves',
    });

    expect(findByEmail).toHaveBeenCalledWith('bruno@balcao.com');
    expect(findByHandle).toHaveBeenCalledWith('b.alves');
    expect(save).toHaveBeenCalled();
    expect(created.id).toBe('u-1');
    expect(created.role).toBe('technician');
  });

  it('bloqueia e-mail duplicado', async () => {
    const existing = User.register({
      name: 'A',
      email: 'a@a.com',
      role: 'user',
    }).withId('1');
    const module = await Test.createTestingModule({
      providers: [
        CreateUserService,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findByEmail: jest.fn().mockResolvedValue(existing),
            findByHandle: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    await expect(
      module.get(CreateUserService).execute({
        name: 'A',
        email: 'a@a.com',
        role: 'user',
      }),
    ).rejects.toThrow(UserEmailAlreadyExistsError);
  });
});
