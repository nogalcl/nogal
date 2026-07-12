-- CreateEnum
CREATE TYPE "TrendCategory" AS ENUM ('NEWS', 'MARKET', 'DESIGN', 'MATERIAL', 'DESIGNER', 'MANUFACTURER', 'ICONIC_PIECE');

-- CreateTable
CREATE TABLE "Trend" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" "TrendCategory" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "imageCredit" TEXT,
    "materialId" UUID,
    "woodTypeId" UUID,
    "styleId" UUID,
    "designerId" UUID,
    "manufacturerId" UUID,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trend_slug_key" ON "Trend"("slug");

-- CreateIndex
CREATE INDEX "Trend_category_idx" ON "Trend"("category");

-- CreateIndex
CREATE INDEX "Trend_materialId_idx" ON "Trend"("materialId");

-- CreateIndex
CREATE INDEX "Trend_woodTypeId_idx" ON "Trend"("woodTypeId");

-- CreateIndex
CREATE INDEX "Trend_styleId_idx" ON "Trend"("styleId");

-- CreateIndex
CREATE INDEX "Trend_designerId_idx" ON "Trend"("designerId");

-- CreateIndex
CREATE INDEX "Trend_manufacturerId_idx" ON "Trend"("manufacturerId");

-- CreateIndex
CREATE INDEX "Trend_publishedAt_idx" ON "Trend"("publishedAt");

-- AddForeignKey
ALTER TABLE "Trend" ADD CONSTRAINT "Trend_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trend" ADD CONSTRAINT "Trend_woodTypeId_fkey" FOREIGN KEY ("woodTypeId") REFERENCES "WoodType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trend" ADD CONSTRAINT "Trend_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trend" ADD CONSTRAINT "Trend_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trend" ADD CONSTRAINT "Trend_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

