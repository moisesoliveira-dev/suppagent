import { CreateClientService } from './create-client.service';
import { Client } from '../domain/client';
import { ClientEmailAlreadyExistsError } from '../domain/client.errors';
import type {
  ClientRepository,
  ClientWithTickets,
} from '../domain/client.repository';

function memoryRepo(seed: Client[] = []): ClientRepository {
  const store = new Map(seed.map((c) => [c.id, c]));
  return {
    async findAll() {
      return [...store.values()];
    },
    async findAllWithTickets(): Promise<ClientWithTickets[]> {
      return [...store.values()].map((client) => ({ client, tickets: [] }));
    },
    async findById(id) {
      return store.get(id) ?? null;
    },
    async findByIdWithTickets(id) {
      const client = store.get(id);
      return client ? { client, tickets: [] } : null;
    },
    async findByEmail(email) {
      return (
        [...store.values()].find((c) => c.email === email.toLowerCase()) ?? null
      );
    },
    async save(client) {
      store.set(client.id, client);
    },
    async delete(id) {
      store.delete(id);
    },
  };
}

describe('CreateClientService', () => {
  it('persiste cliente novo', async () => {
    const repo = memoryRepo();
    const service = new CreateClientService(repo);
    const client = await service.execute({
      name: 'helena',
      plan: 'starter',
      email: 'helena@email.com',
    });
    expect(client.email).toBe('helena@email.com');
    expect(await repo.findByEmail('helena@email.com')).toBeTruthy();
  });

  it('bloqueia e-mail duplicado', async () => {
    const existing = Client.create({
      name: 'a',
      plan: 'pro',
      email: 'dup@email.com',
    });
    const service = new CreateClientService(memoryRepo([existing]));
    await expect(
      service.execute({
        name: 'b',
        plan: 'pro',
        email: 'dup@email.com',
      }),
    ).rejects.toBeInstanceOf(ClientEmailAlreadyExistsError);
  });
});
