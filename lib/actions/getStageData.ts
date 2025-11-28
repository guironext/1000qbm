"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getStageData() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { 
      palmares: true
    }
  });

  if (!user) {
    throw new Error("User not found");
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

  // Check if user has no palmares
  if (user.palmares.length === 0) {
    // Find stage 1
    const stage1 = allStages.find(stage => stage.numOrder === 1);
    
    if (stage1) {
      // Update stage 1 statusStage to CURRENT
      await prisma.stage.update({
        where: { id: stage1.id },
        data: { statusStage: 'CURRENT' }
      });

      return {
        currentStage: {
          ...stage1,
          statusStage: 'CURRENT'
        },
        allStages: allStages.map(stage => 
          stage.id === stage1.id 
            ? { ...stage, statusStage: 'CURRENT' } 
            : stage
        )
      };
    }
  }

  return {
    currentStage: allStages.find(stage => stage.statusStage === 'CURRENT') || allStages[0],
    allStages
  };
}





