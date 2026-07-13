-- DropForeignKey
ALTER TABLE "Furniture" DROP CONSTRAINT "Furniture_categoryId_fkey";

-- AlterTable
ALTER TABLE "Furniture" ALTER COLUMN "categoryId" DROP NOT NULL,
ALTER COLUMN "condition" DROP NOT NULL,
ALTER COLUMN "price" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Furniture" ADD CONSTRAINT "Furniture_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
