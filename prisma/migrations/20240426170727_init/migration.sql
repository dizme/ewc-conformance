-- CreateTable
CREATE TABLE "SessionData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itbSessionId" TEXT NOT NULL,
    "issuerSessionId" TEXT NOT NULL,
    "state" TEXT NOT NULL
);
