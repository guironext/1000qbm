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

export async function getStagePageData() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/fr/joueur" });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      palmares: { orderBy: { createdAt: "desc" } },
      jeuEnCours: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const hasPalmares = user.palmares && user.palmares.length > 0;

  if (!hasPalmares) {
    // Create palmares with defaults
    await prisma.palmares.create({
      data: {
        userId: user.id,
        score: 0,
        stage: "Stage 1",
        section: "Session 1",
        stageNumOrder: 1,
        sectionNumOrder: 1,
        jeuValide: false,
      },
    });

    // Create jeuEnCours for current user
    await prisma.jeuEnCours.create({
      data: {
        userId: user.id,
        stage: "Stage 1",
        section: "Session 1",
        stageNumOrder: 1,
        sectionNumOrder: 1,
      },
    });
  }

  // Get stage: use jeuEnCours.stageNumOrder (user has palmares) or 1 (new user)
  const latestJeuEnCours = user.jeuEnCours?.[0];
  const stageNumOrder = hasPalmares && latestJeuEnCours
    ? latestJeuEnCours.stageNumOrder
    : 1;

  const stage = await prisma.stage.findFirst({
    where: { numOrder: stageNumOrder },
    include: { descriptions: true },
  });

  if (!stage) {
    redirect("/fr/joueur");
  }

  return { stage };
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

  // Find stage by stageNumOrder from palmares
  const [currentStage, allStages, allSections, allJeux] = await Promise.all([
    prisma.stage.findFirst({
      where: { numOrder: latestPalmares.stageNumOrder },
      include: { descriptions: true },
    }),
    prisma.stage.findMany({ orderBy: { numOrder: "asc" } }),
    prisma.section.findMany({ orderBy: { numOrder: "asc" } }),
    prisma.jeu.findMany({ orderBy: { numOrder: "asc" } }),
  ]);

  if (!currentStage) {
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
      jeuEnCours: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!user || !user.jeuEnCours?.[0]) {
    throw new Error("User or jeuEnCours not found");
  }

  const latestJeuEnCours = user.jeuEnCours[0];

  // Find stage where numOrder === jeuEnCours.stageNumOrder
  const stage = await prisma.stage.findFirst({
    where: { numOrder: latestJeuEnCours.stageNumOrder },
    include: { section: { orderBy: { numOrder: "asc" } } },
  });

  if (!stage) {
    redirect("/fr/joueur");
  }

  // Select section where section.numOrder === jeuEnCours.sectionNumOrder
  const section =
    stage.section.find(
      (s) => s.numOrder === latestJeuEnCours.sectionNumOrder
    ) ??
    (await prisma.section.findFirst({
      where: {
        numOrder: latestJeuEnCours.sectionNumOrder,
        stageId: stage.id,
      },
    })) ??
    (await prisma.section.findFirst({
      where: { numOrder: latestJeuEnCours.sectionNumOrder },
    }));

  if (!section) {
    redirect("/fr/joueur");
  }

  // Set jeuId on jeuEnCours so section page has the correct jeu
  const firstJeu = await prisma.jeu.findFirst({
    where: {
      OR: [{ sectionId: section.id }, { stageId: stage.id }],
    },
    orderBy: { numOrder: "asc" },
  });

  if (firstJeu) {
    await prisma.jeuEnCours.update({
      where: { id: latestJeuEnCours.id },
      data: {
        stageId: stage.id,
        sectionId: section.id,
        jeuId: firstJeu.id,
      },
    });
  }

  redirect(`/fr/joueur/stage/section`);
}

export async function getSectionPageDataByJeuEnCours() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/fr/joueur" });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      jeuEnCours: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!user) {
    redirect("/fr/joueur");
  }

  const latestJeuEnCours = user.jeuEnCours?.[0];
  if (!latestJeuEnCours) {
    redirect("/fr/joueur");
  }

  // Find stage where numOrder === jeuEnCours.stageNumOrder
  const stage = await prisma.stage.findFirst({
    where: { numOrder: latestJeuEnCours.stageNumOrder },
  });

  if (!stage) {
    redirect("/fr/joueur");
  }

  // Select section where section.numOrder === jeuEnCours.sectionNumOrder
  // Try with stageId first; fallback to numOrder only if sections have stageId null
  let section = await prisma.section.findFirst({
    where: {
      numOrder: latestJeuEnCours.sectionNumOrder,
      stageId: stage.id,
    },
    include: {
      jeux: {
        orderBy: { numOrder: "asc" },
        include: {
          questions: {
            orderBy: { orderNum: "asc" },
            include: { reponses: true },
          },
        },
      },
    },
  });

  if (!section) {
    section = await prisma.section.findFirst({
      where: { numOrder: latestJeuEnCours.sectionNumOrder },
      include: {
        jeux: {
          orderBy: { numOrder: "asc" },
          include: {
            questions: {
              orderBy: { orderNum: "asc" },
              include: { reponses: true },
            },
          },
        },
      },
    });
  }

  if (!section) {
    redirect("/fr/joueur");
  }

  // Prefer jeu from jeuEnCours if it belongs to this section, else first jeu in section
  let jeu =
    (latestJeuEnCours.jeuId &&
      section.jeux.find((j) => j.id === latestJeuEnCours.jeuId)) ||
    section.jeux[0];

  // Fallback: if section has no jeux, get first jeu from stage (jeux with stageId or sectionId)
  if (!jeu) {
    const stageJeu = await prisma.jeu.findFirst({
      where: {
        OR: [{ sectionId: section.id }, { stageId: stage.id }],
      },
      orderBy: { numOrder: "asc" },
      include: {
        questions: {
          orderBy: { orderNum: "asc" },
          include: { reponses: true },
        },
      },
    });
    if (!stageJeu) redirect("/fr/joueur");
    jeu = stageJeu;
  }

  if (!jeu) {
    redirect("/fr/joueur");
  }

  return { section, jeu };
}

export async function getSectionPageData(sectionId: string) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/fr/joueur" });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      jeuEnCours: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!user) {
    redirect("/fr/joueur");
  }

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: {
      jeux: {
        orderBy: { numOrder: "asc" },
        include: {
          questions: {
            orderBy: { orderNum: "asc" },
            include: { reponses: true },
          },
        },
      },
    },
  });

  if (!section) {
    redirect("/fr/joueur");
  }

  // Prefer jeu from jeuEnCours if it belongs to this section, else first jeu
  const latestJeuEnCours = user.jeuEnCours?.[0];
  const jeu =
    (latestJeuEnCours?.jeuId &&
      section.jeux.find((j) => j.id === latestJeuEnCours.jeuId)) ||
    section.jeux[0];

  if (!jeu) {
    redirect("/fr/joueur");
  }

  return { section, jeu };
}

export async function handleVictory(score: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      palmares: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!user || !user.palmares[0]) {
    throw new Error("User or palmares not found");
  }

  const currentPalmares = user.palmares[0];

  // Get current stage and sections to determine next position
  const currentStage = await prisma.stage.findFirst({
    where: { numOrder: currentPalmares.stageNumOrder },
    include: { section: { orderBy: { numOrder: "asc" } } },
  });

  if (!currentStage) {
    console.error("Stage not found for victory handling");
    redirect(`/fr/joueur/emboard`);
  }

  const sectionsInStage = currentStage.section.length;
  const isLastSection =
    currentPalmares.sectionNumOrder >= sectionsInStage;

  // 1. Update current palmares
  await prisma.palmares.update({
    where: { id: currentPalmares.id },
    data: { score, jeuValide: true },
  });

  if (isLastSection) {
    // Move to next stage
    const nextStage = await prisma.stage.findFirst({
      where: { numOrder: currentStage.numOrder + 1 },
      include: { section: { orderBy: { numOrder: "asc" } } },
    });
    if (!nextStage || !nextStage.section[0]) {
      redirect(`/fr/joueur/emboard`);
    }
    await prisma.palmares.create({
      data: {
        userId: user.id,
        score: 0,
        stage: nextStage.niveau,
        section: nextStage.section[0].niveau,
        stageNumOrder: nextStage.numOrder,
        sectionNumOrder: nextStage.section[0].numOrder,
        jeuValide: false,
      },
    });
    redirect(`/fr/joueur/transitStage`);
  } else {
    // Move to next section in same stage
    const nextSection = currentStage.section.find(
      (s) => s.numOrder === currentPalmares.sectionNumOrder + 1
    );
    if (!nextSection) {
      redirect(`/fr/joueur/emboard`);
    }
    await prisma.palmares.create({
      data: {
        userId: user.id,
        score: 0,
        stage: currentStage.niveau,
        section: nextSection.niveau,
        stageNumOrder: currentPalmares.stageNumOrder,
        sectionNumOrder: nextSection.numOrder,
        jeuValide: false,
      },
    });
    redirect(`/fr/joueur/emboard`);
  }
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

/**
 * Handles "Niveau Suivant" for the stage/section flow.
 * Updates palmares, checks if all sections in stage are completed,
 * then either advances to next stage (/fr/joueur/stage) or next section (/fr/joueur/stage/section).
 */
export async function handleNiveauSuivantStage(score: number) {
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

  if (!user || !user.jeuEnCours[0]) {
    throw new Error("User or jeuEnCours not found");
  }

  const latestJeuEnCours = user.jeuEnCours[0];

  // Find palmares for current stage/section (matching jeuEnCours)
  let currentPalmares = user.palmares.find(
    (p) =>
      p.stageNumOrder === latestJeuEnCours.stageNumOrder &&
      p.sectionNumOrder === latestJeuEnCours.sectionNumOrder
  );

  // Create palmares if missing (e.g. first time in section)
  if (!currentPalmares) {
    const currentStageForCreate = await prisma.stage.findFirst({
      where: { numOrder: latestJeuEnCours.stageNumOrder },
      include: { section: true },
    });
    const sectionForCreate = currentStageForCreate?.section.find(
      (s) => s.numOrder === latestJeuEnCours.sectionNumOrder
    );
    if (!currentStageForCreate || !sectionForCreate) {
      throw new Error("Stage or section not found");
    }
    currentPalmares = await prisma.palmares.create({
      data: {
        userId: user.id,
        score: 0,
        stage: latestJeuEnCours.stage,
        section: latestJeuEnCours.section,
        stageNumOrder: latestJeuEnCours.stageNumOrder,
        sectionNumOrder: latestJeuEnCours.sectionNumOrder,
        jeuValide: false,
        stageId: currentStageForCreate.id,
        sectionId: sectionForCreate.id,
      },
    });
  }

  // 1. Update palmares with score and jeuValide
  await prisma.palmares.update({
    where: { id: currentPalmares.id },
    data: { score, jeuValide: true },
  });

  // 2. Get stage where numOrder === jeuEnCours.stageNumOrder
  const currentStage = await prisma.stage.findFirst({
    where: { numOrder: latestJeuEnCours.stageNumOrder },
    include: { section: { orderBy: { numOrder: "asc" } } },
  });

  if (!currentStage) {
    redirect("/fr/joueur");
  }

  // 3. Count palmares for this stage (after our update)
  const palmaresCountForStage = await prisma.palmares.count({
    where: {
      userId: user.id,
      stageNumOrder: latestJeuEnCours.stageNumOrder,
    },
  });

  const sectionsInStage = currentStage.section.length;
  const allSectionsCompleted = sectionsInStage === palmaresCountForStage;

  if (allSectionsCompleted) {
    // All sections in stage completed -> move to next stage
    const nextStage = await prisma.stage.findFirst({
      where: { numOrder: currentStage.numOrder + 1 },
      include: { section: { orderBy: { numOrder: "asc" } } },
    });

    if (!nextStage || !nextStage.section[0]) {
      redirect("/fr/joueur/stage");
    }

    const firstSectionOfNextStage = nextStage.section[0];

    // Create palmares for the new stage's first section (needed for next Niveau Suivant)
    await prisma.palmares.create({
      data: {
        userId: user.id,
        score: 0,
        stage: nextStage.niveau,
        section: firstSectionOfNextStage.niveau,
        stageNumOrder: nextStage.numOrder,
        sectionNumOrder: firstSectionOfNextStage.numOrder,
        jeuValide: false,
        stageId: nextStage.id,
        sectionId: firstSectionOfNextStage.id,
      },
    });

    await prisma.jeuEnCours.update({
      where: { id: latestJeuEnCours.id },
      data: {
        stage: nextStage.niveau,
        section: firstSectionOfNextStage.niveau,
        stageNumOrder: nextStage.numOrder,
        sectionNumOrder: firstSectionOfNextStage.numOrder,
        stageId: nextStage.id,
        sectionId: firstSectionOfNextStage.id,
        jeuId: null,
      },
    });

    redirect("/fr/joueur/stage");
  } else {
    // More sections to complete -> create new palmares, update jeuEnCours, go to next section
    const nextSection = currentStage.section.find(
      (s) => s.numOrder === latestJeuEnCours.sectionNumOrder + 1
    );

    if (!nextSection) {
      redirect("/fr/joueur/stage");
    }

    const nextJeu = await prisma.jeu.findFirst({
      where: { sectionId: nextSection.id },
      orderBy: { numOrder: "asc" },
    });

    // Create new palmares for next section
    await prisma.palmares.create({
      data: {
        userId: user.id,
        score: 0,
        stage: currentStage.niveau,
        section: nextSection.niveau,
        stageNumOrder: currentStage.numOrder,
        sectionNumOrder: nextSection.numOrder,
        jeuValide: false,
        stageId: currentStage.id,
        sectionId: nextSection.id,
      },
    });

    // Update jeuEnCours for next section
    await prisma.jeuEnCours.update({
      where: { id: latestJeuEnCours.id },
      data: {
        stage: currentStage.niveau,
        section: nextSection.niveau,
        stageNumOrder: currentStage.numOrder,
        sectionNumOrder: nextSection.numOrder,
        stageId: currentStage.id,
        sectionId: nextSection.id,
        jeuId: nextJeu?.id ?? null,
      },
    });

    redirect("/fr/joueur/stage/section");
  }
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
    where: { numOrder: latestPalmares.stageNumOrder },
    include: { section: { orderBy: { numOrder: "asc" } } },
  });

  if (!currentStage) {
    redirect("/fr/joueur");
  }

  const sectionsInStage = currentStage.section.length;
  const allSectionsInStageCompleted =
    latestPalmares.sectionNumOrder >= sectionsInStage;

  // Update current palmares with score and validation
  await prisma.palmares.update({
    where: { id: latestPalmares.id },
    data: { score, jeuValide: true },
  });

  if (!allSectionsInStageCompleted) {
    // NO: More sections to complete in current stage
    const nextSection = currentStage.section.find(
      (s) => s.numOrder === latestPalmares.sectionNumOrder + 1
    );
    if (!nextSection) {
      redirect("/fr/joueur/emboard");
    }

    const nextJeu = await prisma.jeu.findFirst({
      where: { sectionId: nextSection.id },
      orderBy: { numOrder: "asc" },
    });

    await prisma.jeuEnCours.update({
      where: { id: latestJeuEnCours.id },
      data: {
        stage: currentStage.niveau,
        section: nextSection.niveau,
        stageNumOrder: currentStage.numOrder,
        sectionNumOrder: nextSection.numOrder,
        jeuId: nextJeu?.id ?? null,
      },
    });

    await prisma.palmares.create({
      data: {
        userId: user.id,
        score: 0,
        stage: currentStage.niveau,
        section: nextSection.niveau,
        stageNumOrder: latestPalmares.stageNumOrder,
        sectionNumOrder: nextSection.numOrder,
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

    if (!nextStage || !nextStage.section[0]) {
      redirect("/fr/joueur/emboard");
    }

    const firstSectionOfNextStage = nextStage.section[0];
    const nextJeu = await prisma.jeu.findFirst({
      where: { sectionId: firstSectionOfNextStage.id },
      orderBy: { numOrder: "asc" },
    });

    await prisma.jeuEnCours.update({
      where: { id: latestJeuEnCours.id },
      data: {
        stage: nextStage.niveau,
        section: firstSectionOfNextStage.niveau,
        stageNumOrder: nextStage.numOrder,
        sectionNumOrder: firstSectionOfNextStage.numOrder,
        jeuId: nextJeu?.id ?? null,
      },
    });

    await prisma.palmares.create({
      data: {
        userId: user.id,
        score: 0,
        stage: nextStage.niveau,
        section: firstSectionOfNextStage.niveau,
        stageNumOrder: nextStage.numOrder,
        sectionNumOrder: firstSectionOfNextStage.numOrder,
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

  // Get unique (stageNumOrder, sectionNumOrder) pairs from palmares
  const stageSectionPairs = [
    ...new Set(
      user.palmares.map((p) => `${p.stageNumOrder}-${p.sectionNumOrder}`)
    ),
  ].map((key) => {
    const [s, sec] = key.split("-").map(Number);
    return { stageNumOrder: s, sectionNumOrder: sec };
  });

  // Fetch stages and sections to find Jeux for each palmares
  const stages = await prisma.stage.findMany({
    where: { numOrder: { in: stageSectionPairs.map((p) => p.stageNumOrder) } },
    include: {
      section: {
        orderBy: { numOrder: "asc" },
        include: { jeux: { orderBy: { numOrder: "asc" } } },
      },
    },
  });

  const stageMap = new Map(stages.map((s) => [s.numOrder, s]));

  function getJeuForPalmares(p: { stageNumOrder: number; sectionNumOrder: number }) {
    const stage = stageMap.get(p.stageNumOrder);
    if (!stage) return null;
    const section = stage.section.find((sec) => sec.numOrder === p.sectionNumOrder);
    if (!section || !section.jeux?.length) return null;
    return section.jeux[0] ?? null;
  }

  const palmaresWithJeux = user.palmares.map((p) => ({
    ...p,
    jeu: getJeuForPalmares(p) || null,
  }));

  const currentPalmaresObj = user.palmares.find((p) => !p.jeuValide) || null;

  const currentPalmares = currentPalmaresObj
    ? {
        ...currentPalmaresObj,
        jeu: getJeuForPalmares(currentPalmaresObj) || null,
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
