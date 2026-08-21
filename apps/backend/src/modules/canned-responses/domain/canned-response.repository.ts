import type { CannedResponse } from './canned-response';

export const CANNED_RESPONSE_REPOSITORY = Symbol('CANNED_RESPONSE_REPOSITORY');

export interface CannedResponseRepository {
  findAll(category?: string): Promise<CannedResponse[]>;
  findById(id: string): Promise<CannedResponse | null>;
  findByShortcut(shortcut: string): Promise<CannedResponse | null>;
  listCategories(): Promise<string[]>;
  save(response: CannedResponse): Promise<void>;
  delete(id: string): Promise<void>;
}
