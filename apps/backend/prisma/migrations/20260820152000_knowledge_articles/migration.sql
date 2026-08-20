-- CreateTable
CREATE TABLE "knowledge_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorName" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "usefulPercent" INTEGER NOT NULL DEFAULT 0,
    "ticketsAvoided" INTEGER NOT NULL DEFAULT 0,
    "sourceTicketId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_articles_sourceTicketId_key" ON "knowledge_articles"("sourceTicketId");

-- CreateIndex
CREATE INDEX "knowledge_articles_category_idx" ON "knowledge_articles"("category");

-- CreateIndex
CREATE INDEX "knowledge_articles_published_idx" ON "knowledge_articles"("published");
