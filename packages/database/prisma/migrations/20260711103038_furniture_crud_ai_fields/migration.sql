-- CreateEnum
CREATE TYPE "Originality" AS ENUM ('ORIGINAL', 'REPRODUCTION');

-- CreateEnum
CREATE TYPE "ShippingMethod" AS ENUM ('STANDARD', 'WHITE_GLOVE', 'PICKUP_ONLY');

-- CreateEnum
CREATE TYPE "FurnitureVerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "FurnitureValuationStatus" AS ENUM ('NONE', 'REQUESTED', 'IN_PROGRESS', 'COMPLETED');

-- AlterEnum
BEGIN;
CREATE TYPE "FurnitureStatus_new" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'RESERVED', 'SOLD', 'ARCHIVED', 'REJECTED');
ALTER TABLE "public"."Furniture" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Furniture" ALTER COLUMN "status" TYPE "FurnitureStatus_new" USING ("status"::text::"FurnitureStatus_new");
ALTER TYPE "FurnitureStatus" RENAME TO "FurnitureStatus_old";
ALTER TYPE "FurnitureStatus_new" RENAME TO "FurnitureStatus";
DROP TYPE "public"."FurnitureStatus_old";
ALTER TABLE "Furniture" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "Furniture" DROP CONSTRAINT "Furniture_woodTypeId_fkey";

-- AlterTable
ALTER TABLE "Furniture" DROP COLUMN "woodTypeId",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "confidenceLevel" INTEGER,
ADD COLUMN     "locationCity" TEXT,
ADD COLUMN     "locationCountryId" UUID,
ADD COLUMN     "locationRegion" TEXT,
ADD COLUMN     "originality" "Originality" NOT NULL DEFAULT 'ORIGINAL',
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "shippingMethods" "ShippingMethod"[],
ADD COLUMN     "valuationStatus" "FurnitureValuationStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "verificationStatus" "FurnitureVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedById" UUID;

-- CreateTable
CREATE TABLE "_FurnitureToWoodType" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_FurnitureToWoodType_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FurnitureToWoodType_B_index" ON "_FurnitureToWoodType"("B");

-- CreateIndex
CREATE INDEX "Furniture_locationCountryId_idx" ON "Furniture"("locationCountryId");

-- AddForeignKey
ALTER TABLE "Furniture" ADD CONSTRAINT "Furniture_locationCountryId_fkey" FOREIGN KEY ("locationCountryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Furniture" ADD CONSTRAINT "Furniture_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FurnitureToWoodType" ADD CONSTRAINT "_FurnitureToWoodType_A_fkey" FOREIGN KEY ("A") REFERENCES "Furniture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FurnitureToWoodType" ADD CONSTRAINT "_FurnitureToWoodType_B_fkey" FOREIGN KEY ("B") REFERENCES "WoodType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

