-- GameBook model was in schema but never migrated; aligns DB with prisma/schema.prisma

-- CreateEnum
CREATE TYPE "public"."GameBookStatus" AS ENUM ('EN_COURS', 'VALIDE', 'ACCOMPLIS');

-- CreateEnum
CREATE TYPE "public"."GameBookKind" AS ENUM ('STAGE', 'SECTION');

-- CreateTable
CREATE TABLE "public"."GameBook" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "public"."GameBookKind" NOT NULL,
    "targetId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "sectionId" TEXT,
    "stageValidated" BOOLEAN NOT NULL DEFAULT false,
    "stageStatus" "public"."GameBookStatus" NOT NULL DEFAULT 'EN_COURS',
    "stageNiveau" TEXT NOT NULL,
    "stageNumOrder" INTEGER NOT NULL,
    "stageAccomplished" BOOLEAN NOT NULL DEFAULT false,
    "sectionValidated" BOOLEAN NOT NULL DEFAULT false,
    "sectionStatus" "public"."GameBookStatus" NOT NULL DEFAULT 'EN_COURS',
    "sectionNiveau" TEXT NOT NULL,
    "sectionNumOrsder" INTEGER NOT NULL,
    "sectionAccomplished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameBook_userId_idx" ON "public"."GameBook"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GameBook_userId_kind_targetId_key" ON "public"."GameBook"("userId", "kind", "targetId");

-- AddForeignKey
ALTER TABLE "public"."GameBook" ADD CONSTRAINT "GameBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."GameBook" ADD CONSTRAINT "GameBook_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "public"."Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."GameBook" ADD CONSTRAINT "GameBook_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
