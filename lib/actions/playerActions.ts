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
    const [firstStage, firstSection] = await Promise.all([
      prisma.stage.findFirst({ orderBy: { numOrder: "asc" } }),
      prisma.section.findFirst({ orderBy: { numOrder: "asc" } }),
    ]);

    const stageNiveau = firstStage?.niveau ?? "1";
    const sectionNiveau = firstSection?.niveau ?? "1";

    const firstJeu = await prisma.jeu.findFirst({
      where: firstStage ? { stageId: firstStage.id } : undefined,
      orderBy: { numOrder: "asc" },
    });

    await prisma.palmares.create({
      data: {
        userId: user.id,
        compteurJeu: 1,
        stageLength: 1,
        score: 0,
        jeuNiveauValide: null,
        jeuValide: false,
      },
    });

    if (prisma.jeuEnCours) {
      await prisma.jeuEnCours.create({
        data: {
          userId: user.id,
          stage: stageNiveau,
          section: sectionNiveau,
          jeuId: firstJeu?.id ?? null,
        },
      });
    }
  } else {
    // User has palmares: ensure jeuEnCours exists
    if (prisma.jeuEnCours) {
      const latestJeuEnCours = await prisma.jeuEnCours.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      });

      if (!latestJeuEnCours) {
        const currentJeu = await prisma.jeu.findFirst({
          where: { numOrder: existingPalmares.compteurJeu },
          include: { stage: true, section: true },
        });

        const stageNiveau = currentJeu?.stage?.niveau ?? "1";
        const sectionNiveau = currentJeu?.section?.niveau ?? "1";

        await prisma.jeuEnCours.create({
          data: {
            userId: user.id,
            stage: stageNiveau,
            section: sectionNiveau,
            jeuId: currentJeu?.id ?? null,
          },
        });
      }
    }
  }

  redirect("/fr/joueur/emboard");
}
