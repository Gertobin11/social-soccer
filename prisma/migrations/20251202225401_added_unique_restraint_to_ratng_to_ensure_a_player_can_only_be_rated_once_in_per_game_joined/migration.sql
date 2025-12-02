/*
  Warnings:

  - A unique constraint covering the columns `[gameID,playerID]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Rating_gameID_playerID_key" ON "Rating"("gameID", "playerID");
