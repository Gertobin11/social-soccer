-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_addressID_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "addressID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_addressID_fkey" FOREIGN KEY ("addressID") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
