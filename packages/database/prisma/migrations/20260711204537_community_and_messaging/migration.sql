-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'NEW_FOLLOWER';
ALTER TYPE "NotificationType" ADD VALUE 'FURNITURE_FAVORITED';
ALTER TYPE "NotificationType" ADD VALUE 'FURNITURE_SOLD';
ALTER TYPE "NotificationType" ADD VALUE 'MODERATION_ACTION';

-- AlterEnum
ALTER TYPE "ReportTargetType" ADD VALUE 'CONVERSATION';

-- AlterTable
ALTER TABLE "Furniture" ALTER COLUMN "currency" SET DEFAULT 'CLP';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "attachmentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "deliveredAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "listingsCount",
DROP COLUMN "salesCount",
ADD COLUMN     "followersCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "followingCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "locationCity" TEXT,
ADD COLUMN     "locationCountryId" UUID,
ADD COLUMN     "locationRegion" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "schedule" JSONB,
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "websiteUrl" TEXT;

-- CreateTable
CREATE TABLE "Follow" (
    "followerId" UUID NOT NULL,
    "followingId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "Block" (
    "blockerId" UUID NOT NULL,
    "blockedId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("blockerId","blockedId")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "storeId" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionItem" (
    "id" UUID NOT NULL,
    "collectionId" UUID NOT NULL,
    "furnitureId" UUID NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");

-- CreateIndex
CREATE INDEX "Block_blockedId_idx" ON "Block"("blockedId");

-- CreateIndex
CREATE INDEX "Collection_ownerId_idx" ON "Collection"("ownerId");

-- CreateIndex
CREATE INDEX "Collection_storeId_idx" ON "Collection"("storeId");

-- CreateIndex
CREATE INDEX "CollectionItem_furnitureId_idx" ON "CollectionItem"("furnitureId");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionItem_collectionId_furnitureId_key" ON "CollectionItem"("collectionId", "furnitureId");

-- CreateIndex
CREATE INDEX "Store_locationCountryId_idx" ON "Store"("locationCountryId");

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_furnitureId_fkey" FOREIGN KEY ("furnitureId") REFERENCES "Furniture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_locationCountryId_fkey" FOREIGN KEY ("locationCountryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

