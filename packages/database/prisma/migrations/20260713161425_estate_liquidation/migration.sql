
-- CreateEnum
CREATE TYPE "EstateLiquidationRequestStatus" AS ENUM ('DRAFT', 'PENDING', 'IN_REVIEW', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EstateLiquidationPieceOutcome" AS ENUM ('SELL_ON_NOGAL', 'REFER_RESTORER', 'INFORM_ONLY');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ESTATE_LIQUIDATION_READY';

-- CreateTable
CREATE TABLE "EstateLiquidationRequest" (
    "id" UUID NOT NULL,
    "requesterId" UUID NOT NULL,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "addressLine" TEXT,
    "addressCity" TEXT,
    "addressRegion" TEXT,
    "visitNotes" TEXT,
    "unitFee" DECIMAL(12,2) NOT NULL DEFAULT 14990,
    "totalFee" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'CLP',
    "paidAt" TIMESTAMP(3),
    "status" "EstateLiquidationRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "assignedExpertId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstateLiquidationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstateLiquidationPiece" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" UUID,
    "outcome" "EstateLiquidationPieceOutcome",
    "condition" "FurnitureCondition",
    "expertNotes" TEXT,
    "estimatedValueMin" DECIMAL(12,2),
    "estimatedValueMax" DECIMAL(12,2),
    "recommendedRestorerId" UUID,
    "classifiedAt" TIMESTAMP(3),
    "classifiedById" UUID,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstateLiquidationPiece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstateLiquidationPieceImage" (
    "id" UUID NOT NULL,
    "pieceId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstateLiquidationPieceImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstateLiquidationComment" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstateLiquidationComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Restorer" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "city" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restorer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EstateLiquidationRequest_requesterId_idx" ON "EstateLiquidationRequest"("requesterId");

-- CreateIndex
CREATE INDEX "EstateLiquidationRequest_status_idx" ON "EstateLiquidationRequest"("status");

-- CreateIndex
CREATE INDEX "EstateLiquidationRequest_assignedExpertId_idx" ON "EstateLiquidationRequest"("assignedExpertId");

-- CreateIndex
CREATE INDEX "EstateLiquidationPiece_requestId_idx" ON "EstateLiquidationPiece"("requestId");

-- CreateIndex
CREATE INDEX "EstateLiquidationPiece_categoryId_idx" ON "EstateLiquidationPiece"("categoryId");

-- CreateIndex
CREATE INDEX "EstateLiquidationPiece_recommendedRestorerId_idx" ON "EstateLiquidationPiece"("recommendedRestorerId");

-- CreateIndex
CREATE INDEX "EstateLiquidationPieceImage_pieceId_idx" ON "EstateLiquidationPieceImage"("pieceId");

-- CreateIndex
CREATE INDEX "EstateLiquidationComment_requestId_idx" ON "EstateLiquidationComment"("requestId");

-- CreateIndex
CREATE INDEX "Restorer_isActive_idx" ON "Restorer"("isActive");

-- AddForeignKey
ALTER TABLE "EstateLiquidationRequest" ADD CONSTRAINT "EstateLiquidationRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateLiquidationRequest" ADD CONSTRAINT "EstateLiquidationRequest_assignedExpertId_fkey" FOREIGN KEY ("assignedExpertId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateLiquidationPiece" ADD CONSTRAINT "EstateLiquidationPiece_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "EstateLiquidationRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateLiquidationPiece" ADD CONSTRAINT "EstateLiquidationPiece_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateLiquidationPiece" ADD CONSTRAINT "EstateLiquidationPiece_recommendedRestorerId_fkey" FOREIGN KEY ("recommendedRestorerId") REFERENCES "Restorer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateLiquidationPiece" ADD CONSTRAINT "EstateLiquidationPiece_classifiedById_fkey" FOREIGN KEY ("classifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateLiquidationPieceImage" ADD CONSTRAINT "EstateLiquidationPieceImage_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "EstateLiquidationPiece"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateLiquidationComment" ADD CONSTRAINT "EstateLiquidationComment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "EstateLiquidationRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateLiquidationComment" ADD CONSTRAINT "EstateLiquidationComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

