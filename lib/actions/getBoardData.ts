"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getBoardData() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { 
      boardIndex: true,
      palmares: {
        where: {
          statusJeu: 'CURRENT'
        },
        include: {
          jeu: {
            include: {
              stage: {
                include: {
                  descriptions: true
                }
              },
              section: true
            }
          },
          section: true,
          stage: {
            include: {
              descriptions: true
            }
          }
        }
      }
    }
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if Palmares exists for current user
  if (user.palmares.length === 0) {
    // No Palmares: select boardIndex===1 and jeu.numOrder===1, then stage.numOrder===1
    const stage = await prisma.stage.findFirst({
      where: {
        numOrder: 1,
      },
      include: {
        descriptions: true,
        jeux: {
          where: {
            numOrder: 1
          }
        }
      }
    });

    if (!stage || stage.jeux.length === 0) {
      return null;
    }

    return {
      id: stage.jeux[0].id,
      image: stage.image,
      title: stage.title,
      description: stage.descriptions.map(d => d.texte).join('\n'),
      descriptions: stage.descriptions,
      niveau: stage.niveau,
      numOrder: undefined,
      type: 'stage' as const
    };
  } else {
    // Palmares exists with statusJeu === CURRENT
    const currentPalmares = user.palmares[0];
    
    if (!currentPalmares || !currentPalmares.jeu) {
      return null;
    }

    // Get the stage related to the current jeu
    const stage = currentPalmares.jeu.stage;
    
    if (!stage) {
      return null;
    }

    // Check if palmares.numOrder is 1, 5, 10, 15, 20, or 25
    const isMilestone = [1, 5, 10, 15, 20, 25].includes(currentPalmares.numOrder);

    return {
      id: currentPalmares.jeuId || '',
      image: stage.image,
      title: stage.title,
      description: stage.descriptions?.map(d => d.texte).join('\n') || '',
      descriptions: stage.descriptions || [],
      niveau: stage.niveau,
      numOrder: isMilestone ? currentPalmares.numOrder : undefined,
      type: 'stage' as const
    };
  }
}

