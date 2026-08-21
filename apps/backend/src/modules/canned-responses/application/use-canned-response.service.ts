import { Inject, Injectable } from '@nestjs/common';
import type { CannedResponse } from '../domain/canned-response';
import {
  CANNED_RESPONSE_REPOSITORY,
  type CannedResponseRepository,
} from '../domain/canned-response.repository';
import { CannedResponseNotFoundError } from '../domain/canned.errors';

@Injectable()
export class UseCannedResponseService {
  constructor(
    @Inject(CANNED_RESPONSE_REPOSITORY)
    private readonly responses: CannedResponseRepository,
  ) {}

  async execute(id: string): Promise<CannedResponse> {
    const response = await this.responses.findById(id);
    if (!response) throw new CannedResponseNotFoundError(id);
    response.markUsed();
    await this.responses.save(response);
    return response;
  }
}
