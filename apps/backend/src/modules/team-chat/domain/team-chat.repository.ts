import type { TeamChat } from './team-chat';

export const TEAM_CHAT_REPOSITORY = Symbol('TEAM_CHAT_REPOSITORY');

export interface TeamChatRepository {
  findById(id: string): Promise<TeamChat | null>;
  findAll(): Promise<TeamChat[]>;
  save(chat: TeamChat): Promise<TeamChat>;
}
