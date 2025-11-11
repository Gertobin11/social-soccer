-- CreateTable
CREATE TABLE "RequestToJoin" (
    "id" SERIAL NOT NULL,
    "gameID" INTEGER NOT NULL,
    "playerID" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted" BOOLEAN,

    CONSTRAINT "RequestToJoin_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RequestToJoin" ADD CONSTRAINT "RequestToJoin_gameID_fkey" FOREIGN KEY ("gameID") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestToJoin" ADD CONSTRAINT "RequestToJoin_playerID_fkey" FOREIGN KEY ("playerID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
