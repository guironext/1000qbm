/*
  Warnings:

  - You are about to drop the column `title` on the `Jeu` table. All the data in the column will be lost.
  - You are about to drop the column `dernierNiveau` on the `Palmares` table. All the data in the column will be lost.
  - You are about to drop the column `niveau` on the `Palmares` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `stageId` on the `Section` table. All the data in the column will be lost.
  - Added the required column `langue` to the `Jeu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stageId` to the `Jeu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `langue` to the `Palmares` table without a default value. This is not possible if the table is not empty.
  - Added the required column `niveauJeu` to the `Palmares` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sectionNumOrder` to the `Palmares` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stageNumOrder` to the `Palmares` table without a default value. This is not possible if the table is not empty.
  - Added the required column `langue` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `langue` to the `Reponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `langue` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `langue` to the `Stage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('NEW', 'VALIDATED', 'CURRENT');

-- CreateEnum
CREATE TYPE "Langue" AS ENUM ('FR', 'EN', 'ES', 'PT', 'DE');

-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_stageId_fkey";

-- AlterTable
ALTER TABLE "Jeu" DROP COLUMN "title",
ADD COLUMN     "langue" "Langue" NOT NULL,
ADD COLUMN     "stageId" TEXT NOT NULL,
ADD COLUMN     "statusJeu" "Status" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "valide" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Palmares" DROP COLUMN "dernierNiveau",
DROP COLUMN "niveau",
ADD COLUMN     "langue" "Langue" NOT NULL,
ADD COLUMN     "niveauJeu" TEXT NOT NULL,
ADD COLUMN     "sectionId" TEXT,
ADD COLUMN     "sectionNumOrder" INTEGER NOT NULL,
ADD COLUMN     "stageId" TEXT,
ADD COLUMN     "stageLength" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "stageNumOrder" INTEGER NOT NULL,
ADD COLUMN     "statusJeu" "Status" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "statusSection" "Status" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "statusStage" "Status" NOT NULL DEFAULT 'NEW',
ALTER COLUMN "isFinished" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "image",
ADD COLUMN     "langue" "Langue" NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "valide" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Reponse" ADD COLUMN     "langue" "Langue" NOT NULL;

-- AlterTable
ALTER TABLE "Section" DROP COLUMN "stageId",
ADD COLUMN     "langue" "Langue" NOT NULL,
ADD COLUMN     "statusSection" "Status" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "valide" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "langue" "Langue" NOT NULL,
ADD COLUMN     "statusStage" "Status" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "valide" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "BoardIndex" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "play1" INTEGER NOT NULL DEFAULT 1,
    "play2" INTEGER NOT NULL DEFAULT 2,
    "play3" INTEGER NOT NULL DEFAULT 3,
    "play4" INTEGER NOT NULL DEFAULT 4,
    "play5" INTEGER NOT NULL DEFAULT 5,
    "play6" INTEGER NOT NULL DEFAULT 6,
    "play7" INTEGER NOT NULL DEFAULT 7,
    "play8" INTEGER NOT NULL DEFAULT 8,
    "play9" INTEGER NOT NULL DEFAULT 9,
    "play10" INTEGER NOT NULL DEFAULT 10,
    "play11" INTEGER NOT NULL DEFAULT 11,
    "play12" INTEGER NOT NULL DEFAULT 12,
    "play13" INTEGER NOT NULL DEFAULT 13,
    "play14" INTEGER NOT NULL DEFAULT 14,
    "play15" INTEGER NOT NULL DEFAULT 15,
    "play16" INTEGER NOT NULL DEFAULT 16,
    "play17" INTEGER NOT NULL DEFAULT 17,
    "play18" INTEGER NOT NULL DEFAULT 18,
    "play19" INTEGER NOT NULL DEFAULT 19,
    "play20" INTEGER NOT NULL DEFAULT 20,
    "play21" INTEGER NOT NULL DEFAULT 21,
    "play22" INTEGER NOT NULL DEFAULT 22,
    "play23" INTEGER NOT NULL DEFAULT 23,
    "play24" INTEGER NOT NULL DEFAULT 24,
    "play25" INTEGER NOT NULL DEFAULT 25,

    CONSTRAINT "BoardIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompteurSection" (
    "id" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "stageId" TEXT NOT NULL,
    "userId" TEXT,
    "sectionId" TEXT NOT NULL,
    "palmaresId" TEXT,

    CONSTRAINT "CompteurSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoardIndex_userId_key" ON "BoardIndex"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CompteurSection_userId_stageId_sectionId_key" ON "CompteurSection"("userId", "stageId", "sectionId");

-- AddForeignKey
ALTER TABLE "Jeu" ADD CONSTRAINT "Jeu_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardIndex" ADD CONSTRAINT "BoardIndex_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Palmares" ADD CONSTRAINT "Palmares_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Palmares" ADD CONSTRAINT "Palmares_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompteurSection" ADD CONSTRAINT "CompteurSection_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompteurSection" ADD CONSTRAINT "CompteurSection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompteurSection" ADD CONSTRAINT "CompteurSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompteurSection" ADD CONSTRAINT "CompteurSection_palmaresId_fkey" FOREIGN KEY ("palmaresId") REFERENCES "Palmares"("id") ON DELETE SET NULL ON UPDATE CASCADE;
