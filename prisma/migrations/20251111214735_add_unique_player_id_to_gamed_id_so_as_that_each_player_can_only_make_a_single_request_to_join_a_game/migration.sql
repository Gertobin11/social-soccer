/*
  Warnings:

  - A unique constraint covering the columns `[gameID,playerID]` on the table `RequestToJoin` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RequestToJoin_gameID_playerID_key" ON "RequestToJoin"("gameID", "playerID");
