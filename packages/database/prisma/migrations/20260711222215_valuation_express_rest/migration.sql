-- CreateEnum
CREATE TYPE "ValuationObjective" AS ENUM ('SELL', 'BUY', 'IDENTIFY', 'RESTORE');

-- AlterTable
ALTER TABLE "ValuationReport" DROP COLUMN "notes",
ADD COLUMN     "condition" "FurnitureCondition",
ADD COLUMN     "confidenceLevel" INTEGER,
ADD COLUMN     "decade" INTEGER,
ADD COLUMN     "designerId" UUID,
ADD COLUMN     "estimatedSaleTime" TEXT,
ADD COLUMN     "idealSaleValue" DECIMAL(12,2),
ADD COLUMN     "manufacturerId" UUID,
ADD COLUMN     "observations" TEXT,
ADD COLUMN     "pdfUrl" TEXT,
ADD COLUMN     "probableIdentification" TEXT,
ADD COLUMN     "quickSaleValue" DECIMAL(12,2),
ADD COLUMN     "styleId" UUID,
ADD COLUMN     "summary" TEXT NOT NULL,
ADD COLUMN     "tips" TEXT,
ADD COLUMN     "warnings" TEXT,
ALTER COLUMN "currency" SET DEFAULT 'CLP';

-- AlterTable
ALTER TABLE "ValuationRequest" DROP COLUMN "imageUrls",
ADD COLUMN     "assignedExpertId" UUID,
ADD COLUMN     "categoryId" UUID,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'CLP',
ADD COLUMN     "estimatedDecade" INTEGER,
ADD COLUMN     "locationCity" TEXT,
ADD COLUMN     "objective" "ValuationObjective",
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "serviceFee" DECIMAL(12,2) NOT NULL DEFAULT 19990,
ADD COLUMN     "title" TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "ValuationRequestImage" (
    "id" UUID NOT NULL,
    "valuationRequestId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValuationRequestImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValuationComment" (
    "id" UUID NOT NULL,
    "valuationRequestId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValuationComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MaterialToValuationReport" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_MaterialToValuationReport_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ValuationReportToWoodType" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ValuationReportToWoodType_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "ValuationRequestImage_valuationRequestId_idx" ON "ValuationRequestImage"("valuationRequestId");

-- CreateIndex
CREATE INDEX "ValuationComment_valuationRequestId_idx" ON "ValuationComment"("valuationRequestId");

-- CreateIndex
CREATE INDEX "_MaterialToValuationReport_B_index" ON "_MaterialToValuationReport"("B");

-- CreateIndex
CREATE INDEX "_ValuationReportToWoodType_B_index" ON "_ValuationReportToWoodType"("B");

-- CreateIndex
CREATE INDEX "ValuationReport_styleId_idx" ON "ValuationReport"("styleId");

-- CreateIndex
CREATE INDEX "ValuationReport_designerId_idx" ON "ValuationReport"("designerId");

-- CreateIndex
CREATE INDEX "ValuationReport_manufacturerId_idx" ON "ValuationReport"("manufacturerId");

-- CreateIndex
CREATE INDEX "ValuationRequest_assignedExpertId_idx" ON "ValuationRequest"("assignedExpertId");

-- CreateIndex
CREATE INDEX "ValuationRequest_categoryId_idx" ON "ValuationRequest"("categoryId");

-- AddForeignKey
ALTER TABLE "ValuationRequest" ADD CONSTRAINT "ValuationRequest_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValuationRequest" ADD CONSTRAINT "ValuationRequest_assignedExpertId_fkey" FOREIGN KEY ("assignedExpertId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValuationRequestImage" ADD CONSTRAINT "ValuationRequestImage_valuationRequestId_fkey" FOREIGN KEY ("valuationRequestId") REFERENCES "ValuationRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValuationComment" ADD CONSTRAINT "ValuationComment_valuationRequestId_fkey" FOREIGN KEY ("valuationRequestId") REFERENCES "ValuationRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValuationComment" ADD CONSTRAINT "ValuationComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValuationReport" ADD CONSTRAINT "ValuationReport_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValuationReport" ADD CONSTRAINT "ValuationReport_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValuationReport" ADD CONSTRAINT "ValuationReport_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MaterialToValuationReport" ADD CONSTRAINT "_MaterialToValuationReport_A_fkey" FOREIGN KEY ("A") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MaterialToValuationReport" ADD CONSTRAINT "_MaterialToValuationReport_B_fkey" FOREIGN KEY ("B") REFERENCES "ValuationReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ValuationReportToWoodType" ADD CONSTRAINT "_ValuationReportToWoodType_A_fkey" FOREIGN KEY ("A") REFERENCES "ValuationReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ValuationReportToWoodType" ADD CONSTRAINT "_ValuationReportToWoodType_B_fkey" FOREIGN KEY ("B") REFERENCES "WoodType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

