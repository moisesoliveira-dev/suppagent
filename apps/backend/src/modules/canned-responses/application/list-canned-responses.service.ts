import { Inject, Injectable } from '@nestjs/common';
import {
  CANNED_RESPONSE_REPOSITORY,
  type CannedResponseRepository,
} from '../domain/canned-response.repository';
import type { CannedResponse } from '../domain/canned-response';

@Injectable()
export class ListCannedResponsesService {
  constructor(
    @Inject(CANNED_RESPONSE_REPOSITORY)
    private readonly responses: CannedResponseRepository,
  ) {}

  async execute(category?: string) {
    const [items, categories] = await Promise.all([
      this.responses.findAll(category),
      this.responses.listCategories(),
    ]);
    return { items, categories };
  }
}
