import { Inject, Injectable } from '@nestjs/common';
import { Client } from '../domain/client';
import type { ClientPlan } from '../domain/client-plan';
import { ClientEmailAlreadyExistsError } from '../domain/client.errors';
import {
  CLIENT_REPOSITORY,
  type ClientRepository,
} from '../domain/client.repository';

export type CreateClientCommand = {
  name: string;
  company?: string | null;
  plan: ClientPlan;
  email: string;
  phone?: string | null;
  tags?: string[];
};

@Injectable()
export class CreateClientService {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clients: ClientRepository,
  ) {}

  async execute(command: CreateClientCommand): Promise<Client> {
    const client = Client.create(command);
    const existing = await this.clients.findByEmail(client.email);
    if (existing) {
      throw new ClientEmailAlreadyExistsError(client.email);
    }
    await this.clients.save(client);
    return client;
  }
}
