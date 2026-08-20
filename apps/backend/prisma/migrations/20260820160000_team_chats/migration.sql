-- CreateEnum
CREATE TYPE "TeamChatKind" AS ENUM ('CHANNEL', 'DIRECT');

-- CreateTable
CREATE TABLE "team_chats" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "TeamChatKind" NOT NULL DEFAULT 'CHANNEL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_chat_messages" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "authorHandle" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "editedAt" TIMESTAMP(3),
    "pinnedAt" TIMESTAMP(3),
    "replyToId" TEXT,
    "forwardedFromName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_chat_messages_chatId_idx" ON "team_chat_messages"("chatId");

-- AddForeignKey
ALTER TABLE "team_chat_messages" ADD CONSTRAINT "team_chat_messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "team_chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
