import { Inject, Injectable } from '@nestjs/common';
import type { Client } from '../domain/client';
import {
  CLIENT_REPOSITORY,
  type ClientRepository,
  type ClientWithTickets,
} from '../domain/client.repository';

@Injectable()
export class ListClientsService {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clients: ClientRepository,
  ) {}

  execute(): Promise<ClientWithTickets[]> {
    return this.clients.findAllWithTickets();
  }
}

@Injectable()
export class GetClientService {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clients: ClientRepository,
  ) {}

  execute(id: string): Promise<ClientWithTickets | null> {
    return this.clients.findByIdWithTickets(id);
  }
}
