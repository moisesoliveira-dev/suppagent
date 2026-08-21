import { Inject, Injectable } from '@nestjs/common';
import {
  CANNED_RESPONSE_REPOSITORY,
  type CannedResponseRepository,
} from '../domain/canned-response.repository';
import { CannedResponseNotFoundError } from '../domain/canned.errors';

@Injectable()
export class DeleteCannedResponseService {
  constructor(
    @Inject(CANNED_RESPONSE_REPOSITORY)
    private readonly responses: CannedResponseRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const response = await this.responses.findById(id);
    if (!response) throw new CannedResponseNotFoundError(id);
    await this.responses.delete(id);
  }
}
