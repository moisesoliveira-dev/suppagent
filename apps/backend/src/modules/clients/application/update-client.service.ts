import { Inject, Injectable } from '@nestjs/common';
import type { Client } from '../domain/client';
import type { ClientPlan } from '../domain/client-plan';
import {
  ClientEmailAlreadyExistsError,
  ClientNotFoundError,
} from '../domain/client.errors';
import {
  CLIENT_REPOSITORY,
  type ClientRepository,
} from '../domain/client.repository';

export type UpdateClientCommand = {
  id: string;
  name?: string;
  company?: string | null;
  plan?: ClientPlan;
  email?: string;
  phone?: string | null;
  tags?: string[];
};

@Injectable()
export class UpdateClientService {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clients: ClientRepository,
  ) {}

  async execute(command: UpdateClientCommand): Promise<Client> {
    const client = await this.clients.findById(command.id);
    if (!client) throw new ClientNotFoundError(command.id);

    if (command.email !== undefined) {
      const nextEmail = command.email.trim().toLowerCase();
      if (nextEmail !== client.email) {
        const existing = await this.clients.findByEmail(nextEmail);
        if (existing && existing.id !== client.id) {
          throw new ClientEmailAlreadyExistsError(nextEmail);
        }
      }
    }

    client.update({
      name: command.name,
      company: command.company,
      plan: command.plan,
      email: command.email,
      phone: command.phone,
      tags: command.tags,
    });
    await this.clients.save(client);
    return client;
  }
}
