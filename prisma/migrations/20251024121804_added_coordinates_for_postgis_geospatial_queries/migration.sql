/*
  Warnings:

  - A unique constraint covering the columns `[coordinatesID]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `coordinatesID` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "coordinatesID" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Coordinates" (
    "id" SERIAL NOT NULL,
    "coordinates" geography(Point, 4326) NOT NULL,

    CONSTRAINT "Coordinates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Coordinates_coordinates_idx" ON "Coordinates" USING GIST ("coordinates");

-- CreateIndex
CREATE UNIQUE INDEX "Address_coordinatesID_key" ON "Address"("coordinatesID");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_coordinatesID_fkey" FOREIGN KEY ("coordinatesID") REFERENCES "Coordinates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
