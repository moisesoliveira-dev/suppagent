-- CreateEnum
CREATE TYPE "ClientPlan" AS ENUM ('STARTER', 'PRO', 'EMPRESA');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "plan" "ClientPlan" NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE INDEX "clients_plan_idx" ON "clients"("plan");

-- CreateIndex
CREATE INDEX "clients_name_idx" ON "clients"("name");
