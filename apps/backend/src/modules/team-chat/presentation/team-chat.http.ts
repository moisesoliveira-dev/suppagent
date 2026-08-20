import { TeamChat } from '../domain/team-chat';
import {
  formatElapsed,
  formatHistoryTime,
} from '../../tickets/presentation/ticket-format';

export function toTeamChatHttp(chat: TeamChat, now = new Date()) {
  const byId = new Map(chat.messages.map((entry) => [entry.id, entry]));
  const last = [...chat.messages].reverse().find((entry) => !entry.deletedAt);

  return {
    id: chat.id,
    name: chat.name,
    kind: chat.kind,
    category: 'equipe' as const,
    time: last
      ? formatElapsed(last.occurredAt, now)
      : formatElapsed(chat.createdAt, now),
    snippet: last
      ? last.deletedAt
        ? 'mensagem apagada'
        : last.text
      : 'sem mensagens',
    messages: chat.messages.map((entry) => {
      const reply = entry.replyToId ? byId.get(entry.replyToId) : undefined;
      return {
        id: entry.id,
        time: formatHistoryTime(entry.occurredAt),
        text: entry.deletedAt ? '' : entry.text,
        author: 'agent' as const,
        authorName: entry.authorName,
        authorHandle: entry.authorHandle,
        ...(entry.deletedAt ? { deleted: true } : {}),
        ...(entry.editedAt && !entry.deletedAt ? { edited: true } : {}),
        ...(entry.pinnedAt && !entry.deletedAt
          ? {
              pinned: true,
              pinnedTime: formatHistoryTime(entry.pinnedAt),
            }
          : {}),
        ...(entry.replyToId ? { replyToId: entry.replyToId } : {}),
        ...(reply && !reply.deletedAt
          ? {
              replyToText: reply.text,
              replyToAuthorName: reply.authorName,
            }
          : reply
            ? {
                replyToText: 'mensagem apagada',
                replyToAuthorName: reply.authorName,
              }
            : {}),
        ...(entry.forwardedFromName
          ? {
              forwarded: true,
              forwardedFromName: entry.forwardedFromName,
            }
          : {}),
      };
    }),
  };
}
