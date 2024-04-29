/*
  Warnings:

  - You are about to drop the `SessionData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SessionData";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "IssuanceSessionData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itbSessionId" TEXT NOT NULL,
    "issuerSessionId" TEXT NOT NULL,
    "state" TEXT NOT NULL
);
