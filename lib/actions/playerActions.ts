"use server";

import { prisma } from "../prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function startGameAction() {
  const { userId: clerkId, redirectToSignIn } = await auth();

  if (!clerkId) {
    return redirectToSignIn({ returnBackUrl: "/fr/joueur" });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      palmares: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const existingPalmares = user.palmares?.[0] ?? null;

  if (!existingPalmares) {
    // No palmares: create palmares + jeuEnCours (Stage 1, Section 1), then redirect
    const firstStage = await prisma.stage.findFirst({
      orderBy: { numOrder: "asc" },
      include: { section: { orderBy: { numOrder: "asc" } } },
    });
    const firstSection = firstStage?.section[0];

    const stageNiveau = firstStage?.niveau ?? "Stage 1";
    const sectionNiveau = firstSection?.niveau ?? "section 1";

    const firstJeu = firstSection
      ? await prisma.jeu.findFirst({
          where: { sectionId: firstSection.id },
          orderBy: { numOrder: "asc" },
        })
      : firstStage
        ? await prisma.jeu.findFirst({
            where: { stageId: firstStage.id },
            orderBy: { numOrder: "asc" },
          })
        : null;

    await prisma.palmares.create({
      data: {
        userId: user.id,
        score: 0,
        stage: stageNiveau,
        section: sectionNiveau,
        stageNumOrder: firstStage?.numOrder ?? 1,
        sectionNumOrder: firstSection?.numOrder ?? 1,
        jeuValide: false,
      },
    });

    await prisma.jeuEnCours.create({
      data: {
        userId: user.id,
        stage: stageNiveau,
        section: sectionNiveau,
        stageNumOrder: firstStage?.numOrder ?? 1,
        sectionNumOrder: firstSection?.numOrder ?? 1,
        jeuId: firstJeu?.id ?? null,
      },
    });
  } else {
    // User has palmares: ensure jeuEnCours exists
    if (prisma.jeuEnCours) {
      const latestJeuEnCours = await prisma.jeuEnCours.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      });

      if (!latestJeuEnCours) {
        const currentStage = await prisma.stage.findFirst({
          where: { numOrder: existingPalmares.stageNumOrder },
          include: { section: { orderBy: { numOrder: "asc" } } },
        });
        const currentSection = currentStage?.section.find(
          (s) => s.numOrder === existingPalmares.sectionNumOrder
        );
        const currentJeu = currentSection
          ? await prisma.jeu.findFirst({
              where: { sectionId: currentSection.id },
              include: { stage: true, section: true },
              orderBy: { numOrder: "asc" },
            })
          : null;

        const stageNiveau = currentJeu?.stage?.niveau ?? "1";
        const sectionNiveau = currentJeu?.section?.niveau ?? "1";

        await prisma.jeuEnCours.create({
          data: {
            userId: user.id,
            stage: stageNiveau,
            section: sectionNiveau,
            stageNumOrder: existingPalmares.stageNumOrder,
            sectionNumOrder: existingPalmares.sectionNumOrder,
            jeuId: currentJeu?.id ?? null,
          },
        });
      }
    }
  }

  redirect("/fr/joueur/emboard");
}
