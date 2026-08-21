-- CreateTable
CREATE TABLE "routing_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keywords" TEXT[],
    "category" TEXT NOT NULL,
    "agentHandle" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "routing_rules_enabled_idx" ON "routing_rules"("enabled");

-- CreateIndex
CREATE INDEX "routing_rules_category_idx" ON "routing_rules"("category");
