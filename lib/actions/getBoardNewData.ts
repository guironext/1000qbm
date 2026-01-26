"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getBoardNewData() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      palmares: {
        where: {
          statusStage: 'CURRENT'
        }
      }
    }
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get all stages with descriptions
  const allStages = await prisma.stage.findMany({
    include: {
      descriptions: true
    },
    orderBy: {
      numOrder: 'asc'
    }
  });

  const hasPalmares = user.palmares.length > 0;

  if (!hasPalmares) {
    // No palmares - get stage 1
    const stage = allStages.find(s => s.numOrder === 1);
    if (!stage) {
      throw new Error("Stage 1 not found");
    }
    // Get section with numOrder=1
    const section = await prisma.section.findFirst({
      where: { numOrder: 1 }
    });
    if (!section) {
      throw new Error("Section 1 not found");
    }
    return {
      hasPalmares: false,
      stage,
      section,
      user
    };
  }

  // Check if there is a pending stage to display
  const pendingPalmares = user.palmares.find(p => p.statusStage === 'CURRENT' && p.statusJeu === 'NEW');
  if (pendingPalmares) {
    const stage = allStages.find(s => s.id === pendingPalmares.stageId);
    if (stage) {
      const section = await prisma.section.findFirst({
        where: { id: pendingPalmares.sectionId || undefined }
      });
      return {
        hasPalmares: true,
        pendingStage: true,
        stage,
        section,
        user
      };
    }
  }

  return {
    hasPalmares: true,
    user
  };
}

export async function createNewPalmares(stageNumOrder: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get stage with numOrder=stageNumOrder
  const stage = await prisma.stage.findFirst({
    where: { numOrder: stageNumOrder }
  });

  if (!stage) {
    throw new Error(`Stage ${stageNumOrder} not found`);
  }

  // Get section with numOrder=1 for this stage
  const section = await prisma.section.findFirst({
    where: { numOrder: 1 }
  });

  if (!section) {
    throw new Error("Section not found");
  }

  // Get jeu with sectionId and stageId
  const jeu = await prisma.jeu.findFirst({
    where: {
      sectionId: section.id,
      stageId: stage.id
    }
  });

  if (!jeu) {
    throw new Error("Jeu not found for section and stage");
  }

  // Create palmares
  const palmares = await prisma.palmares.create({
    data: {
      userId: user.id,
      langue: (user.langue as 'FR' | 'EN' | 'ES' | 'PT' | 'DE') || 'FR',
      numOrder: 1,
      score: 0,
      isFinished: false,
      stageId: stage.id,
      statusStage: 'CURRENT',
      stageNumOrder: 1,
      stageLength: 1,
      sectionId: section.id,
      statusSection: 'CURRENT',
      sectionNumOrder: 1,
      jeuId: jeu.id,
      statusJeu: 'CURRENT',
      niveauJeu: jeu.niveau
    }
  });
  console.log('Palmares created with ID:', palmares.id);

  return { jeuId: jeu.id };
}

export async function startPendingStage() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Update pending palmares
  const updated = await prisma.palmares.updateMany({
    where: {
      userId: user.id,
      statusStage: 'CURRENT',
      statusJeu: 'NEW'
    },
    data: {
      statusJeu: 'CURRENT'
    }
  });

  if (updated.count === 0) {
    throw new Error("No pending stage found");
  }

  // Get the jeuId
  const palmares = await prisma.palmares.findFirst({
    where: {
      userId: user.id,
      statusJeu: 'CURRENT'
    }
  });

  return { jeuId: palmares?.jeuId };
}