import { Inject, Injectable } from '@nestjs/common';
import { CannedResponse } from '../domain/canned-response';
import {
  CANNED_RESPONSE_REPOSITORY,
  type CannedResponseRepository,
} from '../domain/canned-response.repository';
import { CannedShortcutAlreadyExistsError } from '../domain/canned.errors';

export type CreateCannedResponseCommand = {
  title: string;
  category: string;
  shortcut: string;
  body: string;
};

@Injectable()
export class CreateCannedResponseService {
  constructor(
    @Inject(CANNED_RESPONSE_REPOSITORY)
    private readonly responses: CannedResponseRepository,
  ) {}

  async execute(command: CreateCannedResponseCommand): Promise<CannedResponse> {
    const response = CannedResponse.create(command);
    const existing = await this.responses.findByShortcut(response.shortcut);
    if (existing) {
      throw new CannedShortcutAlreadyExistsError(response.shortcut);
    }
    await this.responses.save(response);
    return response;
  }
}
