-- CreateTable
CREATE TABLE "VerificationSessionData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itbSessionId" TEXT NOT NULL,
    "verifierSessionId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "attributes" TEXT NOT NULL
);
