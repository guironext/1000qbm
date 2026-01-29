"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getBoardPageData() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      palmares: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get latest palmares
  const latestPalmares = user.palmares[0];
  if (!latestPalmares) {
    throw new Error("No palmares found");
  }

  // Select stage where stage.numOrder === Palmares.compteurJeu
  const [currentStage, allStages, allSections, allJeux] = await Promise.all([
    prisma.stage.findFirst({
      where: {
        numOrder: latestPalmares.compteurJeu,
      },
      include: {
        descriptions: true,
      },
    }),
    prisma.stage.findMany({ orderBy: { numOrder: "asc" } }),
    prisma.section.findMany({ orderBy: { numOrder: "asc" } }),
    prisma.jeu.findMany({ orderBy: { numOrder: "asc" } }),
  ]);

  if (!currentStage) {
    // Handle case where no stage matches (maybe finished game or config error)
    // For now, return null or throw.
    console.warn(
      "Current stage not found for order:",
      latestPalmares.compteurJeu,
    );
    return {
      user,
      currentStage: null,
      allStages,
      allSections,
      allJeux,
      latestPalmares,
    };
  }

  return {
    user,
    currentStage,
    allStages,
    allSections,
    allJeux,
    latestPalmares,
  };
}

export async function handleCommenconsClick() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      palmares: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user || !user.palmares[0]) {
    throw new Error("User or palmares not found");
  }

  // Simply redirect to the static page, which will handle data loading itself
  redirect(`/fr/joueur/emboard/jeuSection`);
}

export async function handleVictory(score: number, jeuNiveau: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      palmares: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user || !user.palmares[0]) {
    throw new Error("User or palmares not found");
  }

  const currentPalmares = user.palmares[0];

  // Fetch current Jeu to get Stage info for length comparison
  const currentJeu = await prisma.jeu.findFirst({
    where: { numOrder: currentPalmares.compteurJeu },
    include: { stage: { include: { jeux: true } } },
  });

  if (!currentJeu || !currentJeu.stage) {
    // Fallback if data is missing, though unlikely in valid flow
    console.error("Jeu or Stage not found for victory handling");
    redirect(`/fr/joueur/emboard`);
  }

  const totalGamesInStage = currentJeu.stage.jeux.length;
  // Calculate new values
  const newStageLength = currentPalmares.stageLength + 1;

  // 1. Update current palmares
  await prisma.palmares.update({
    where: { id: currentPalmares.id },
    data: {
      score: score,
      jeuNiveauValide: jeuNiveau,
      jeuValide: true,
      stageLength: currentPalmares.stageLength,
      compteurJeu: currentPalmares.compteurJeu,
    },
  });

  // 3. Determine if stage is finished and prepare new values
  const isStageFinished = newStageLength > totalGamesInStage;
  const nextStageLength = isStageFinished ? 1 : newStageLength;
  const redirectPath = isStageFinished
    ? `/fr/joueur/transitStage`
    : `/fr/joueur/emboard`;

  // 4. Create new palmares
  await prisma.palmares.create({
    data: {
      userId: user.id,
      compteurJeu: currentPalmares.compteurJeu + 1,
      stageLength: nextStageLength,
      score: 0,
      jeuNiveauValide: null,
      jeuValide: false,
    },
  });

  // 5. Redirect
  redirect(redirectPath);
}

export async function getHeaderData() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      palmares: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return null;
  }

  // Collect all unique jeu orders from palmares
  const jeuOrders = [...new Set(user.palmares.map((p) => p.compteurJeu))];

  // Fetch all related Jeux
  const jeux = await prisma.jeu.findMany({
    where: {
      numOrder: { in: jeuOrders },
    },
    include: {
      stage: true,
      section: true,
    },
  });

  // Create a map for quick lookup
  const jeuMap = new Map(jeux.map((j) => [j.numOrder, j]));

  // Stich data together for the frontend
  const palmaresWithJeux = user.palmares.map((p) => ({
    ...p,
    jeu: jeuMap.get(p.compteurJeu) || null,
  }));

  const currentPalmaresObj = user.palmares.find((p) => !p.jeuValide) || null;

  const currentPalmares = currentPalmaresObj
    ? {
        ...currentPalmaresObj,
        jeu: jeuMap.get(currentPalmaresObj.compteurJeu) || null,
      }
    : null;

  return {
    user: {
      ...user,
      palmares: palmaresWithJeux,
    },
    currentPalmares,
  };
}
