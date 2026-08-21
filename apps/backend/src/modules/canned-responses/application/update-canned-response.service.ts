import { Inject, Injectable } from '@nestjs/common';
import type { CannedResponse } from '../domain/canned-response';
import {
  CANNED_RESPONSE_REPOSITORY,
  type CannedResponseRepository,
} from '../domain/canned-response.repository';
import {
  CannedResponseNotFoundError,
  CannedShortcutAlreadyExistsError,
} from '../domain/canned.errors';

export type UpdateCannedResponseCommand = {
  id: string;
  title?: string;
  category?: string;
  shortcut?: string;
  body?: string;
};

@Injectable()
export class UpdateCannedResponseService {
  constructor(
    @Inject(CANNED_RESPONSE_REPOSITORY)
    private readonly responses: CannedResponseRepository,
  ) {}

  async execute(command: UpdateCannedResponseCommand): Promise<CannedResponse> {
    const response = await this.responses.findById(command.id);
    if (!response) throw new CannedResponseNotFoundError(command.id);
    response.update({
      title: command.title,
      category: command.category,
      shortcut: command.shortcut,
      body: command.body,
    });
    if (command.shortcut !== undefined) {
      const conflict = await this.responses.findByShortcut(response.shortcut);
      if (conflict && conflict.id !== response.id) {
        throw new CannedShortcutAlreadyExistsError(response.shortcut);
      }
    }
    await this.responses.save(response);
    return response;
  }
}
