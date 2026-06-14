-- GameBoard model: per-user section progress with denormalized stage/section display data

-- CreateEnum
CREATE TYPE "public"."GameBoardStatus" AS ENUM ('INACTIVE', 'EN_COURS', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."GameBoard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "stageTitle" TEXT NOT NULL,
    "stageNiveau" TEXT NOT NULL,
    "stageImage" TEXT NOT NULL,
    "sectionTitle" TEXT NOT NULL,
    "sectionNiveau" TEXT NOT NULL,
    "sectionImage" TEXT NOT NULL,
    "status" "public"."GameBoardStatus" NOT NULL DEFAULT 'INACTIVE',
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameBoard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameBoard_userId_idx" ON "public"."GameBoard"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GameBoard_userId_sectionId_key" ON "public"."GameBoard"("userId", "sectionId");

-- AddForeignKey
ALTER TABLE "public"."GameBoard" ADD CONSTRAINT "GameBoard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."GameBoard" ADD CONSTRAINT "GameBoard_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "public"."Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."GameBoard" ADD CONSTRAINT "GameBoard_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
