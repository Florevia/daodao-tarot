-- CreateTable
CREATE TABLE "RateBucket" (
    "id" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "windowKey" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelQuota" (
    "model" TEXT NOT NULL,
    "exhaustedUntil" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelQuota_pkey" PRIMARY KEY ("model")
);

-- CreateTable
CREATE TABLE "BudgetTopUp" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amountUsd" DOUBLE PRECISION NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "adminEmail" TEXT NOT NULL,

    CONSTRAINT "BudgetTopUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterpretLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "userEmail" TEXT,
    "guestKey" TEXT,
    "question" TEXT NOT NULL,
    "spreadId" TEXT NOT NULL,
    "contextJson" TEXT NOT NULL DEFAULT '{}',
    "cardsJson" TEXT NOT NULL,
    "readingJson" TEXT,
    "provider" TEXT,
    "modelUsed" TEXT,
    "modelsTried" TEXT NOT NULL DEFAULT '[]',
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "outcome" TEXT NOT NULL,
    "errorReason" TEXT,
    "costUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wouldCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "freeTier" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InterpretLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RateBucket_bucket_windowKey_key" ON "RateBucket"("bucket", "windowKey");

-- CreateIndex
CREATE INDEX "RateBucket_updatedAt_idx" ON "RateBucket"("updatedAt");

-- CreateIndex
CREATE INDEX "InterpretLog_createdAt_idx" ON "InterpretLog"("createdAt");

-- CreateIndex
CREATE INDEX "InterpretLog_outcome_idx" ON "InterpretLog"("outcome");

-- CreateIndex
CREATE INDEX "InterpretLog_userId_idx" ON "InterpretLog"("userId");

-- CreateIndex
CREATE INDEX "InterpretLog_spreadId_idx" ON "InterpretLog"("spreadId");

-- CreateIndex
CREATE INDEX "InterpretLog_modelUsed_idx" ON "InterpretLog"("modelUsed");
