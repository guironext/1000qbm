"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getBoardPageData() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { 
      palmares: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!user) {
    throw new Error("ONBOARDING_REQUIRED");
  }

  // Get all stages
  const allStages = await prisma.stage.findMany({
    include: {
      descriptions: true
    },
    orderBy: {
      numOrder: 'asc'
    }
  });

  // Case 1: If user has no palmares
  if (user.palmares.length === 0) {
    const stage1 = allStages.find(stage => stage.numOrder === 1);
    
    if (!stage1) {
      throw new Error("Stage 1 not found");
    }

    return {
      hasNoPalmares: true,
      stage: stage1,
      user,
      currentPalmares: null
    };
  }

  // Case 2: If user has palmares
  const currentPalmares = user.palmares.find(p => p.statusStage === 'CURRENT');
  
  if (!currentPalmares) {
    throw new Error("No current palmares found");
  }

  const currentStage = allStages.find(stage => stage.numOrder === currentPalmares.numOrder);
  
  if (!currentStage) {
    throw new Error("Current stage not found");
  }

  // Check if current palmares numOrder is 6, 11, 16, or 21
  const isSpecialStage = [6, 11, 16, 21].includes(currentPalmares.numOrder);

  // Get sections for current stage
  const sections = await prisma.section.findMany({
    where: {
      numOrder: currentPalmares.numOrder
    },
    include: {
      jeux: true
    },
    orderBy: {
      numOrder: 'asc'
    }
  });

  return {
    hasNoPalmares: false,
    stage: currentStage,
    user,
    currentPalmares,
    isSpecialStage,
    sections
  };
}

export async function createInitialPalmares(userId: string, stageId: string) {
  try {
    // Get the stage
    const stage = await prisma.stage.findUnique({
      where: { id: stageId }
    });

    if (!stage) {
      throw new Error("Stage not found");
    }

    // Get sections for this stage
    const sections = await prisma.section.findMany({
      where: {
        numOrder: stage.numOrder
      },
      orderBy: {
        numOrder: 'asc'
      }
    });

    const firstSection = sections[0];
    
    if (!firstSection) {
      throw new Error("No section found for this stage");
    }

    // Get jeu for this section
    const jeu = await prisma.jeu.findFirst({
      where: {
        sectionId: firstSection.id
      },
      orderBy: {
        numOrder: 'asc'
      }
    });

    if (!jeu) {
      throw new Error("No jeu found for this section");
    }

    // Create palmares
    await prisma.palmares.create({
      data: {
        userId,
        stageId: stage.id,
        statusStage: "CURRENT",
        stageNumOrder: stage.numOrder,
        stageLength: 1,
        sectionId: firstSection.id,
        statusSection: "CURRENT",
        sectionNumOrder: 1,
        jeuId: jeu.id,
        statusJeu: "CURRENT",
        niveauJeu: jeu.niveau,
        langue: stage.langue,
        numOrder: stage.numOrder,
        score: 0,
        isFinished: false,
      },
    });

    return { success: true, jeuId: jeu.id, sectionId: firstSection.id };
  } catch (error) {
    console.error("Error creating palmares:", error);
    throw error;
  }
}

export async function updatePalmaresSection(palmaresId: string) {
  try {
    const palmares = await prisma.palmares.findUnique({
      where: { id: palmaresId },
      include: {
        stage: true
      }
    });

    if (!palmares || !palmares.stage) {
      throw new Error("Palmares not found");
    }

    // Get sections for current stage
    const sections = await prisma.section.findMany({
      where: {
        numOrder: palmares.numOrder
      },
      orderBy: {
        numOrder: 'asc'
      }
    });

    const firstSection = sections[0];
    
    if (!firstSection) {
      throw new Error("No section found");
    }

    // Get jeu for this section
    const jeu = await prisma.jeu.findFirst({
      where: {
        sectionId: firstSection.id
      },
      orderBy: {
        numOrder: 'asc'
      }
    });

    if (!jeu) {
      throw new Error("No jeu found");
    }

    // Update palmares
    await prisma.palmares.update({
      where: { id: palmaresId },
      data: {
        sectionId: firstSection.id,
        statusSection: "CURRENT",
        jeuId: jeu.id,
        statusJeu: "CURRENT",
      }
    });

    return { success: true, jeuId: jeu.id, sectionId: firstSection.id };
  } catch (error) {
    console.error("Error updating palmares:", error);
    throw error;
  }
}
