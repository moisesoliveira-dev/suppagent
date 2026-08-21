import type { CannedResponse as PrismaCanned } from '../../../generated/client';
import { CannedResponse } from '../domain/canned-response';

export function toDomainCanned(record: PrismaCanned): CannedResponse {
  return CannedResponse.reconstitute({
    id: record.id,
    title: record.title,
    category: record.category,
    shortcut: record.shortcut,
    body: record.body,
    useCount: record.useCount,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toPrismaCannedData(response: CannedResponse) {
  return {
    id: response.id,
    title: response.title,
    category: response.category,
    shortcut: response.shortcut,
    body: response.body,
    useCount: response.useCount,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  };
}
