import { Inject, Injectable } from '@nestjs/common';
import type { CannedResponse } from '../domain/canned-response';
import {
  CANNED_RESPONSE_REPOSITORY,
  type CannedResponseRepository,
} from '../domain/canned-response.repository';
import {
  CannedResponseNotFoundError,
} from '../domain/canned.errors';

@Injectable()
export class DuplicateCannedResponseService {
  constructor(
    @Inject(CANNED_RESPONSE_REPOSITORY)
    private readonly responses: CannedResponseRepository,
  ) {}

  async execute(id: string): Promise<CannedResponse> {
    const source = await this.responses.findById(id);
    if (!source) throw new CannedResponseNotFoundError(id);
    let copy = source.duplicate();
    let attempt = 0;
    while (await this.responses.findByShortcut(copy.shortcut)) {
      attempt += 1;
      copy = source.duplicate();
      copy.update({ shortcut: `${source.shortcut}-copia${attempt}` });
    }
    await this.responses.save(copy);
    return copy;
  }
}
