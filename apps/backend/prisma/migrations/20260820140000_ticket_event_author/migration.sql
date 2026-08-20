-- CreateEnum
CREATE TYPE "TicketEventAuthor" AS ENUM ('REQUESTER', 'AGENT');

-- AlterTable
ALTER TABLE "ticket_events" ADD COLUMN "author" "TicketEventAuthor" NOT NULL DEFAULT 'REQUESTER';

-- Backfill: notes and system-ish agent lines
UPDATE "ticket_events"
SET "author" = 'AGENT'
WHERE "isInternalNote" = true
   OR "text" ILIKE 'chamado %'
   OR "text" ILIKE 'aguardando resposta%';
