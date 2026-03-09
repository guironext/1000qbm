"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getEmboardPageData() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/fr/joueur" });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      jeuEnCours: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const latestJeuEnCours = user.jeuEnCours?.[0];
  if (!latestJeuEnCours) {
    redirect("/fr/joueur");
  }

  const currentStage = await prisma.stage.findFirst({
    where: { niveau: latestJeuEnCours.stage },
    include: { descriptions: true },
  });

  if (!currentStage) {
    redirect("/fr/joueur");
  }

  return {
    stage: currentStage,
  };
}

export async function getBoardPageData() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/fr/joueur" });
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
    redirect("/fr/joueur");
  }

  /* DEBUG LOGGING */
  console.log("DEBUG: getBoardPageData called");
  console.log("DEBUG: latestPalmares.compteurJeu:", latestPalmares.compteurJeu);

  // FIX: compteurJeu tracks the GAME order, not the STAGE order.
  // We need to find the Jeu that corresponds to this order, and then get its Stage.
  const [currentJeu, allStages, allSections, allJeux] = await Promise.all([
    prisma.jeu.findFirst({
      where: {
        numOrder: latestPalmares.compteurJeu,
      },
      include: {
        stage: {
          include: {
            descriptions: true,
          },
        },
      },
    }),
    prisma.stage.findMany({ orderBy: { numOrder: "asc" } }),
    prisma.section.findMany({ orderBy: { numOrder: "asc" } }),
    prisma.jeu.findMany({ orderBy: { numOrder: "asc" } }),
  ]);

  if (currentJeu) {
    console.log(
      "DEBUG: Found Jeu:",
      currentJeu.id,
      "numOrder:",
      currentJeu.numOrder,
    );
    if (currentJeu.stage) {
      console.log("DEBUG: Found Stage via Jeu:", currentJeu.stage.title);
    } else {
      console.log("DEBUG: Jeu found but NO Stage linked!");
    }
  } else {
    console.log("DEBUG: No Jeu found for order:", latestPalmares.compteurJeu);
  }

  const currentStage = currentJeu?.stage || null;

  if (!currentStage) {
    // Handle case where no stage matches (maybe finished game or config error)
    console.warn(
      "Current stage (via Jeu) not found for game order:",
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

export async function getJeuSectionPageData() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/fr/joueur" });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      jeuEnCours: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const latestJeuEnCours = user.jeuEnCours?.[0];
  if (!latestJeuEnCours) {
    redirect("/fr/joueur");
  }

  // Get section where section.niveau === jeuEnCours.section (and belongs to current stage)
  const currentStage = await prisma.stage.findFirst({
    where: { niveau: latestJeuEnCours.stage },
  });

  if (!currentStage) {
    redirect("/fr/joueur");
  }

  // Get the jeu from jeuEnCours.jeuId, or fallback: find jeu by stage
  const jeu = latestJeuEnCours.jeuId
    ? await prisma.jeu.findUnique({
        where: { id: latestJeuEnCours.jeuId },
        include: {
          section: true,
          questions: {
            orderBy: { orderNum: "asc" },
            include: { reponses: true },
          },
        },
      })
    : await prisma.jeu.findFirst({
        where: { stageId: currentStage.id },
        orderBy: { numOrder: "asc" },
        include: {
          section: true,
          questions: {
            orderBy: { orderNum: "asc" },
            include: { reponses: true },
          },
        },
      });

  if (!jeu) {
    redirect("/fr/joueur");
  }

  // Section: prefer jeu.section, else find by niveau (in current stage first, then any)
  let section = jeu.section;
  if (!section) {
    section =
      (await prisma.section.findFirst({
        where: {
          niveau: latestJeuEnCours.section,
          stageId: currentStage.id,
        },
      })) ??
      (await prisma.section.findFirst({
        where: { niveau: latestJeuEnCours.section },
      }));
  }

  return {
    section,
    jeu,
  };
}

export async function handleNiveauSuivant(score: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      palmares: { orderBy: { createdAt: "desc" } },
      jeuEnCours: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!user || !user.palmares[0] || !user.jeuEnCours[0]) {
    throw new Error("User, palmares or jeuEnCours not found");
  }

  const latestPalmares = user.palmares[0];
  const latestJeuEnCours = user.jeuEnCours[0];

  const currentStage = await prisma.stage.findFirst({
    where: { niveau: latestJeuEnCours.stage },
    include: { section: { orderBy: { numOrder: "asc" } } },
  });

  if (!currentStage) {
    redirect("/fr/joueur");
  }

  const sectionsInStage = currentStage.section.length;
  const sectionsCompletedInPalmares = latestPalmares.stageLength;

  const allSectionsInStageCompleted =
    sectionsCompletedInPalmares >= sectionsInStage;

  // Update current palmares with score and validation
  await prisma.palmares.update({
    where: { id: latestPalmares.id },
    data: {
      score,
      jeuNiveauValide: `${latestJeuEnCours.stage}-${latestJeuEnCours.section}`,
      jeuValide: true,
    },
  });

  if (!allSectionsInStageCompleted) {
    // NO: More sections to complete in current stage
    // Select section via jeu where numOrder === palmares.compteurJeu + 1
    const nextJeu = await prisma.jeu.findFirst({
      where: { numOrder: latestPalmares.compteurJeu + 1 },
      include: { section: true },
    });

    const nextSection = nextJeu?.section;
    if (!nextSection) {
      redirect("/fr/joueur/emboard");
    }

    await prisma.jeuEnCours.update({
      where: { id: latestJeuEnCours.id },
      data: {
        stage: currentStage.niveau,
        section: nextSection.niveau,
        jeuId: nextJeu?.id ?? null,
      },
    });

    await prisma.palmares.create({
      data: {
        userId: user.id,
        compteurJeu: latestPalmares.compteurJeu + 1,
        stageLength: latestPalmares.stageLength + 1,
        score: 0,
        jeuNiveauValide: null,
        jeuValide: false,
      },
    });

    redirect("/fr/joueur/emboard/jeuSection");
  } else {
    // YES: All sections in stage completed - move to next stage
    const nextStage = await prisma.stage.findFirst({
      where: { numOrder: currentStage.numOrder + 1 },
      include: { section: { orderBy: { numOrder: "asc" } } },
    });

    if (!nextStage) {
      redirect("/fr/joueur/emboard");
    }

    const firstSectionOfNextStage = nextStage.section[0];
    if (!firstSectionOfNextStage) {
      redirect("/fr/joueur/emboard");
    }

    const nextJeu = await prisma.jeu.findFirst({
      where: { sectionId: firstSectionOfNextStage.id },
      orderBy: { numOrder: "asc" },
    });

    await prisma.jeuEnCours.update({
      where: { id: latestJeuEnCours.id },
      data: {
        stage: nextStage.niveau,
        section: firstSectionOfNextStage.niveau,
        jeuId: nextJeu?.id ?? null,
      },
    });

    await prisma.palmares.create({
      data: {
        userId: user.id,
        compteurJeu: latestPalmares.compteurJeu + 1,
        stageLength: 1,
        score: 0,
        jeuNiveauValide: null,
        jeuValide: false,
      },
    });

    redirect("/fr/joueur/emboard");
  }
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
