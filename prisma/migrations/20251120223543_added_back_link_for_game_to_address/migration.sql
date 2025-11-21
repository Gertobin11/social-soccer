/*
  Warnings:

  - A unique constraint covering the columns `[locationID]` on the table `Game` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Game_locationID_key" ON "Game"("locationID");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_locationID_fkey" FOREIGN KEY ("locationID") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;
