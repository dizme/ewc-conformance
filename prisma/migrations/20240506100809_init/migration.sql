-- CreateTable
CREATE TABLE "IssuanceSessionData" (
    "id" TEXT NOT NULL,
    "itbSessionId" TEXT NOT NULL,
    "issuerSessionId" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "IssuanceSessionData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationSessionData" (
    "id" TEXT NOT NULL,
    "itbSessionId" TEXT NOT NULL,
    "verifierSessionId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "attributes" TEXT NOT NULL,

    CONSTRAINT "VerificationSessionData_pkey" PRIMARY KEY ("id")
);
