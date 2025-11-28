/*
  Warnings:

  - You are about to drop the column `jeuValide` on the `Jeu` table. All the data in the column will be lost.
  - Added the required column `niveau` to the `Palmares` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numOrder` to the `Palmares` table without a default value. This is not possible if the table is not empty.
  - Made the column `stageId` on table `Section` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firstName` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Section" DROP CONSTRAINT "Section_stageId_fkey";

-- AlterTable
ALTER TABLE "public"."Jeu" DROP COLUMN "jeuValide";

-- AlterTable
ALTER TABLE "public"."Palmares" ADD COLUMN     "jeuValide" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "niveau" TEXT NOT NULL,
ADD COLUMN     "numOrder" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Section" ALTER COLUMN "stageId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "langue" DROP NOT NULL,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."Paragraphe" (
    "id" TEXT NOT NULL,
    "texte" TEXT NOT NULL,
    "stageId" TEXT,

    CONSTRAINT "Paragraphe_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Paragraphe" ADD CONSTRAINT "Paragraphe_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "public"."Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Section" ADD CONSTRAINT "Section_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "public"."Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
