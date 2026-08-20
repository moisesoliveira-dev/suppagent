-- AlterTable
ALTER TABLE "ticket_events" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "editedAt" TIMESTAMP(3),
ADD COLUMN "pinnedAt" TIMESTAMP(3),
ADD COLUMN "replyToId" TEXT,
ADD COLUMN "forwardedFromName" TEXT;
