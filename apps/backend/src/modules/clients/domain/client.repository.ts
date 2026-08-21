import type { Client } from './client';

export const CLIENT_REPOSITORY = Symbol('CLIENT_REPOSITORY');

export type ClientTicketRef = {
  id: number;
  subject: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved';
  updatedAt: Date;
};

export type ClientWithTickets = {
  client: Client;
  tickets: ClientTicketRef[];
};

export interface ClientRepository {
  findAll(): Promise<Client[]>;
  findAllWithTickets(): Promise<ClientWithTickets[]>;
  findById(id: string): Promise<Client | null>;
  findByIdWithTickets(id: string): Promise<ClientWithTickets | null>;
  findByEmail(email: string): Promise<Client | null>;
  save(client: Client): Promise<void>;
  delete(id: string): Promise<void>;
}
