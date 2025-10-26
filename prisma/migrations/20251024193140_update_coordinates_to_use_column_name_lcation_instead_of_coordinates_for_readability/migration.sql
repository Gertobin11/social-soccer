/*
  Warnings:

  - You are about to drop the column `coordinates` on the `Coordinates` table. All the data in the column will be lost.
  - Added the required column `location` to the `Coordinates` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Coordinates_coordinates_idx";

-- AlterTable
ALTER TABLE "Coordinates" DROP COLUMN "coordinates",
ADD COLUMN     "location" geography(Point, 4326) NOT NULL;

-- CreateIndex
CREATE INDEX "Coordinates_location_idx" ON "Coordinates" USING GIST ("location");
