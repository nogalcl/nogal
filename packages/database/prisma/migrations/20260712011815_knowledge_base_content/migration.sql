-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "content" TEXT;

-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "content" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "slug" TEXT;

-- Backfill: valor provisional a partir de isoCode; el seed lo sobrescribe
-- con un slug real basado en el nombre en la próxima corrida.
UPDATE "Country" SET "slug" = lower("isoCode") WHERE "slug" IS NULL;

ALTER TABLE "Country" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "Designer" ADD COLUMN     "content" TEXT;

-- AlterTable
ALTER TABLE "Manufacturer" ADD COLUMN     "content" TEXT,
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "content" TEXT;

-- AlterTable
ALTER TABLE "Style" ADD COLUMN     "content" TEXT,
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "WoodType" ADD COLUMN     "content" TEXT;

-- CreateTable
CREATE TABLE "Decade" (
    "id" UUID NOT NULL,
    "value" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Decade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Decade_value_key" ON "Decade"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Country_slug_key" ON "Country"("slug");
