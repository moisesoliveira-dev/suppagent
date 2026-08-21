import { Inject, Injectable } from '@nestjs/common';
import { ClientNotFoundError } from '../domain/client.errors';
import {
  CLIENT_REPOSITORY,
  type ClientRepository,
} from '../domain/client.repository';

@Injectable()
export class DeleteClientService {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clients: ClientRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const client = await this.clients.findById(id);
    if (!client) throw new ClientNotFoundError(id);
    await this.clients.delete(id);
  }
}
